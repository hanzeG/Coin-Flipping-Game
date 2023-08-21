// Step 1 Import Libraries
import { eth, Web3 } from 'web3';
import { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { createHash} from 'crypto';

import {
	AppBar,
	Box,
	Button,
	CssBaseline,
  Container,
	Dialog,
	GlobalStyles,
	IconButton,
	InputAdornment,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	MenuItem,
	Stack,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';

import {
    Add,
    CurrencyExchange,
    Details,
    HistoryOutlined,
    Home,
    Info,
    InfoOutlined,
    NorthEast,
    Payment,
    Receipt,
    Send,
    SouthWest,
    TransferWithinAStation,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';

import { create } from 'zustand';
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { BrowserRouter, createBrowserRouter, Link, Route, RouterProvider, Routes } from "react-router-dom";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
// import { contract } from 'web3/lib/eth.exports';

// Step 2 Connect to Web3 network
const web3 = new Web3('http://127.0.0.1:8545'); //local Geth node

await web3.eth.wallet.load('./wallet.json');
// await web3.eth.wallet.load('');



const contractAdd = '0xda1a488FF6E902cCDf9854fa956e8D7A25bEcE80';
const contractAbi = [
	{
		"inputs": [],
		"name": "init_game",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "reveal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "commitment",
				"type": "uint256"
			}
		],
		"name": "set_commitment",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "settle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "get_players",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_stage",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_values",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_winner",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]


//Step 3 Create Account
const useWalletStore = create((set) => ({
	wallet: [...web3.eth.wallet], createAccount: async () => {
		const newAccount = web3.eth.accounts.create();
		web3.eth.wallet.add(newAccount);
		await web3.eth.wallet.save('./wallet.json');
		set({ wallet: [...web3.eth.wallet] });
	}
}))






//Obtain Home
const HomePage = (props) => {

  // 实例化智能合约对象
  const [contract, setContract] = useState(null);
  useEffect(() => {
    const myContract = new web3.eth.Contract(contractAbi, contractAdd);
    setContract(myContract);
  }, []);


  const { me , balance} = props;


  const [homeState, setHomeState] = useState(false)
  useEffect(() => {
    props.onHomeStateChange(homeState);
  },[homeState]);

  // 获取智能合约状态值
  const [stage, setStage] = useState(null);
  const [player, setPlayer] = useState([]);
  const [value, setValue] = useState({value1: 0, value2: 0});

  //监听winner
  const[winner, setWinner] = useState(null);

  useEffect(() => {
    // 定义一个异步函数来获取智能合约状态
    const getStage = async () => {
      if (contract && contract.methods) {
        const stages = await contract.methods.get_stage().call();

        if(stages.toString()=='0'){
          setStage('Player(0/2) Waitting for Player1 to commit');
        }else if(stages.toString()=='1'){
          setStage('Player(1/2) Waitting for Player2 to commit');
        }else if(stages.toString()=='2'){
          setStage('Player(2/2)Waitting for Player2 to reveal');
        }else if(stages.toString()=='3'){
          setStage('Player(2/2) Waitting for Player1 to reveal');
        }else if(stages.toString()=='4'){
          setStage('Player(2/2) Waitting for settlement');
        }else{
          setStage('Game Over!');
        }

        const addresses = await contract.methods.get_players().call();
        setPlayer(addresses);

        const values = await contract.methods.get_values().call();
        const va1 = values[0].toString();
        const va2 = values[1].toString();
        setValue({value1: va1, value2: va2});

        const winner = await contract.methods.get_winner().call();
        if(winner.toString()=='1'){
          setWinner('    Player1 WIN!');
        }else if(winner.toString()=='2'){
          setWinner('    Player2 WIN!');
        }else if(winner.toString()=='0'){
          setWinner(null);
        }
      }
    };
    getStage();
    }, [[stage],[player],[value],[winner]]); 

    
  // 随机数生成
  const [randomNumber, setRandomNumber] = useState('');
  const [haBD, setHaBD] = useState('')
  // const [ranHex, setRanHex] = useState('');


  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 1000) + 1;
    setRandomNumber(number);
    // setRanHex('0x'+web3.utils.toHex(number));


    const sha256 = (num) => {
      return createHash('sha256','hex')
      .update(web3.utils.hexToBytes(
        web3.utils.padLeft(web3.utils.toHex(num), 64)))
        .digest('hex')};

    setHaBD('0x'+sha256(number));


  }

  useEffect(() => {
    generateRandomNumber();
  },[]);



  // 获取TX
  const [tx, setTx] = useState(null);

  //调用智能合约Commit函数
  const passCommitment = async () => {
    // const accounts = await web3.eth.getAccounts();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 5000000;

    const transact = contract.methods.set_commitment(haBD).send({
      from: me.address,
      value: web3.utils.toWei('20', 'ether'), 
      gasPrice,
      gasLimit,
    });
    setTx(await transact);
  };

  //调用智能合约Reveal函数
  const runReveal = async () => {
    // const accounts = await web3.eth.getAccounts();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 5000000;

    const transact = contract.methods.reveal(randomNumber).send({
      from: me.address, 
      gasPrice,
      gasLimit,
    });
    setTx(await transact);
  }



  //调用智能合约Settle函数
  const runSettle = async () => {
    // const accounts = await web3.eth.getAccounts();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 100000000;

    const transact = contract.methods.settle().send({
      from: me.address, 
      gasPrice,
      gasLimit,
    });
    setTx(await transact);
  
  }




  //调用智能合约Init函数
  const runInit = async () => {
    const accounts = await web3.eth.getAccounts();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 5000000;

    const transact = contract.methods.init_game().send({
      from: me.address, 
      gasPrice,
      gasLimit,
    });
    setTx(await transact);

  }





  //User Interface
  return   <Stack gap={2} sx={{
    justifyContent: 'center',
    alignItems: 'center', height: '80vh' ,
    margin: 5, display: 'flex', flexDirection: 'column',
    }}>
      
    {winner &&(
    <Typography variant="h4">
      Game Result: 
      {winner}
    </Typography>
    )}

    <Typography variant="h5">
      {stage ?? 'error'}
    </Typography>

    {me &&(
    <Typography variant="h6">
      Current Balance: 
      {"  "+web3.utils.fromWei(balance, 'ether').toString()+"  ETH"}
    </Typography>
    )}

    <Typography variant="body1" >
      Player1: 
      {player[0] ?? 'error'}
    </Typography>

    <Typography variant="body1">
      Player2: 
      {player[1] ?? 'error'}
    </Typography>

    <Typography variant="body1">
      Value1:
      {value.value1 ?? 'error'}
    </Typography>

    <Typography variant="body1">
      Value2:
      {value.value2 ?? 'error'}
    </Typography>

    {tx&&(
    <Typography variant="body1">
      Transaction Hash: {tx.transactionHash}
    </Typography>
    )}

    {tx&&(
    <Typography variant="body1">
      Status: {tx.status ? 'Successful':'Unsuccessful'}
    </Typography>
    )}

    {me &&(
    <Typography variant="body1">
      Current Account: {me?.address ?? 'error'}
    </Typography>
    )}








    <TextField
      style={{ width: '50%' }}
      label='Randomly chosen value'
      value={randomNumber ?? ''}
      onChange={e => {
        generateRandomNumber(e.target.value)
      }}
     >
    </TextField>

    <TextField
      style={{ width: '50%' }}
      label='Hashed randomly chosen value'
      value={haBD ?? ''}
      onChange={e => {
        generateRandomNumber(e.target.value)
      }}
     >
    </TextField>







    <Button variant="contained" color="primary" onClick = {async () =>{
      setHomeState(true);
      await passCommitment();
      setHomeState(false);
    }}>
      Commit
    </Button>

    <Button  variant="contained" color="secondary" onClick= {async () =>{
     setHomeState(true);
     await runReveal();
     setHomeState(false);
    }}>
      Reveal
    </Button>

    <Button variant="contained" onClick= {async () =>{
     setHomeState(true);
     await runSettle();
     setHomeState(false);
    }}>
      Settle
    </Button>

    <Button variant="contained" color="secondary" onClick = { async() => {
      setHomeState(true);
      generateRandomNumber();
      await runInit();
      setHomeState(false);
    }}>
      Restart
    </Button>
  
  </Stack>
}
















//Step 4 Obtain History, get block number, traverse all the blocks (in the beginning)
const History = () => {
	const [history, setHistory] = useState([]);
	const [pending, setPending] = useState(false);
	
  const load = async () => {
    setPending(true);
    const lastBlockNumber = parseInt(history.at(-1)?.blockNumber ?? -1);
    const newHistory = [];
    
    for (let i = lastBlockNumber + 1; i <= await web3.eth.getBlockNumber(); i++) {
      const block = await web3.eth.getBlock(i);//traverse the blocks
      
      for (const txHash of block.transactions ?? []) {
        const tx = await web3.eth.getTransaction(txHash);//Obtain the transaction by hash
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        newHistory.push({ ...tx, ...receipt, timestamp: block.timestamp })
      }//obtain the transaction
    }
    
    setHistory((prevHistory) => [...prevHistory, ...newHistory]);//Put together the new history and the old ones
    setPending(false);
  };
  
  useEffect(() => {load()}, []);

  //Monitor the chain (creation of new bolck)
  useEffect(() => {
    let subscription;
    (async () => {
      subscription = await web3.eth.subscribe('newHeads');
      
      subscription.on('data', async (params) => {
        const block = await web3.eth.getBlock(params.number);	  		
        const newHistory = [];
        
        for (const txHash of block.transactions ?? []) {
          const tx = await web3.eth.getTransaction(txHash);
          const receipt = await web3.eth.getTransactionReceipt(txHash);
          newHistory.push({ ...tx, ...receipt, timestamp: block.timestamp })
        }
        
        setHistory((prevHistory) => {
          const history = [...prevHistory];
          
          for (const i of newHistory) {
            if (history.length === 0 || i.blockNumber > history.at(-1).blockNumber) {
              history.push(i);
            }
          }
          
          return history;
        });
      });

    })();

    return () => {
      subscription?.unsubscribe();
    }
  }, []);

  //Use Interface
  return <Box sx={{height: 1000, p: 2, }}>
    
    <DataGrid
    rows={history}
    loading={pending}
    columns={[{
      field: 'transactionHash', headerName: 'Tx Hash', width: 400,
    }, {
      field: 'from', headerName: 'From', width: 400
    }, {
      field: 'to', headerName: 'To', width: 400
    }, {
      field: 'value', headerName: 'Value (ETH)', width: 200, valueGetter: ({ value }) => web3.utils.fromWei(value, 'ether')
    }, {
      field: 'timestamp', headerName: 'Time', width: 300, type: 'dateTime', valueGetter: ({ value }) => new Date(parseInt(value) * 1000)
    }
  ]}

    getRowId={(row) => row.transactionHash}
    disableRowSelectionOnClick
    />

  </Box>;
}


const Index = () => {
    const wallet = useWalletStore((state) => state.wallet);
    const createAccount = useWalletStore((state) =>state.createAccount);// Create account
    const [currentAccount, setCurrentAccount] = useState();
    const [infoOpen, setInfoOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const me = currentAccount === undefined ? undefined : wallet[currentAccount];
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(0);
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState(0);
    
    const handleHomeStateChange = (newState) => {
      setPending(newState);
    }


    useEffect(() => {
      
      if (currentAccount !== undefined && !pending) {
        web3.eth.getBalance(wallet[currentAccount].address).then(setBalance);
      }
    }, [currentAccount, pending]);
    
    useEffect(() => {
      
      if (error) {
        enqueueSnackbar(error, {
          variant: 'error'
        })
        setError('');
      }
    
    }, [error]);
    



return <>
{pending && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, zIndex: 10000, width: '100%' }} />}
<AppBar color='transparent' position='static'>
  <Toolbar>
    <IconButton color='primary' component={Link} to='/'>
      <Home />
    </IconButton>

    <IconButton color='primary' component={Link} to='/history'>
      <HistoryOutlined />
    </IconButton>
      
    <Box ml='auto'></Box>

    <TextField
      sx={{
        width: 500 
      }}
      size='small'
      select
      label="Account"
      value={currentAccount ?? ''}
      onChange={e => {
        setCurrentAccount(+e.target.value);
      }}>
      {wallet.map((a, i) => <MenuItem key={i} value={i}>{a.address}</MenuItem>)}
    </TextField>
    
    <IconButton color='primary' onClick={() => {
      createAccount();
      }}>
      <Add />
    </IconButton>
    
    <IconButton color='primary' disabled={me === undefined} onClick={() => {
      setInfoOpen(true);
      }}>
      <InfoOutlined />
    </IconButton>
          
    <IconButton color='primary' disabled={me === undefined} onClick={() => {
      setPaymentOpen(true);
      }}>
      <Payment />
    </IconButton>
        
  </Toolbar>
</AppBar>






<Routes>
  <Route path='/history' element={<History />} />
  <Route path='/' element={<HomePage  me={me} balance={balance} onHomeStateChange = {handleHomeStateChange}/>} />
</Routes>






<Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
  <Stack gap={2} sx={{
    width: 500, margin: 2, display: 'flex', flexDirection: 'column',
    }}>
      
    <TextField
    label='Balance'
    value={web3.utils.fromWei(balance, 'ether')}
    InputProps={{
    endAdornment: <InputAdornment position="end">
      ETH
      </InputAdornment>
     }}
     >
     </TextField>
     
     <TextField
     label='Private Key'
     type={showPrivateKey ? 'text' : 'password'} value={me?.privateKey}
     InputProps={{
     endAdornment: <InputAdornment position="end">
       <IconButton
       aria-label="toggle password visibility"
       onClick={() => setShowPrivateKey((show) => !show)}
       onMouseDown={(e) => e.preventDefault()}
       edge="end"
       >
         {showPrivateKey ? <VisibilityOff /> : <Visibility />}
       </IconButton>
       </InputAdornment>
       }}
       />
       
       <TextField
       label='Address'
       value={me?.address}
       />
      
  </Stack>
</Dialog>

<Dialog open={paymentOpen} onClose={() => {
    setPaymentOpen(false);
    setRecipientAddress('');
    setAmount(0);
  }}>
    <Stack gap={2} sx={{
      width: 500, margin: 2, display: 'flex', flexDirection: 'column',
    }}>
      <TextField
        label='From'
        value={me?.address}
      />
      <TextField
        label='To'
        value={recipientAddress}
        onChange={(e) => {
         setRecipientAddress(e.target.value);
        }}
      />
        <TextField
          label='Amount'
          type='number'
          value={amount}
          onChange={(e) => {
            setAmount(+e.target.value);
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">
              ETH
            </InputAdornment>
          }}
        />
        
        <Button onClick={async () => { //Transfer money
            setPending(true);
            try {
              await web3.eth.sendSignedTransaction((await me.signTransaction({
              to: recipientAddress, from: me.address, gas: 1000000, value: web3.utils.toWei(amount, 'ether'),
            })).rawTransaction);
            setPaymentOpen(false);
            setRecipientAddress('');
            setAmount(0);
          } catch (e) {
            setError(e.message);
          }
          setPending(false);
        }}>
          Send
        </Button>
      </Stack>
  </Dialog>
  </>

}



const App = () => {
    return <>
    <CssBaseline />
    <SnackbarProvider
      autoHideDuration={5000}
    />
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  </>
}
createRoot(document.getElementById('root')).render(<App />);