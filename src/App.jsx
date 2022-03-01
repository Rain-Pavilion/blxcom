import React, { useState, useEffect } from 'react';
import { batStatusParse,singleVParse } from './utils';
import { message } from 'antd';
import Home from './Home/index';
import BatDetail from './BatDetail/index';
import 'antd/dist/antd.css';
import './App.css';

export let log = true;
export let arr = [];
export let PORT;
export let currentCMD = ''
export let hardwareVersionArr = []; //硬件版本信息
export let batStatusArr = []; //电池状态信息
export let batSingleVArr = []; // 单体电压
export let mosArr = []; // mos信息

function App() {
  const [page,setpage] = useState('BatDetail')
  const [messageList, setMessageList] = useState([])

  const [batStatusObj, setbatStatusObj] = useState({})
  const [hardwareVersion, sethardwareVersion] = useState('')
  const [ports, setports] = useState([])

  const [port, setPort] = useState()
  const [path, setpath] = useState()


  const [singleVArr, setsingleVArr] = useState([])
    const [pkey, setpkey] = useState(0)

  const setLog = (pramas) => {
     log =pramas
  }
  const setcurrentCMD = (pramas) => {
    currentCMD =pramas
  }

  const handleBatStatusArr = (arr) => {
    
    console.log(`batStatusArr`, batStatusArr)
    if(arr.length>0){
      let tempArr = JSON.parse(JSON.stringify(arr))
      setbatStatusObj(batStatusParse(tempArr.join('').match(/[a-z0-9][a-z0-9]/g)))
    }
    
    batStatusArr = []
  }
  const handleBatSingleVArr = (arr) => {
    console.log(`arr`, arr)
    if(arr.length>0){
      //开关量数据
      let tempArr = JSON.parse(JSON.stringify(arr))
      let singleVArr =  tempArr.join('').match(/[a-z0-9][a-z0-9]/g)
      // console.log(`singleVArr`, singleVArr)
      setsingleVArr(singleVParse(singleVArr))
      console.log(`singleVParse(singleVArr`, singleVParse(singleVArr))
    }
    
    batSingleVArr = []
  }

  const handlehardwareVersionArr = (arrData) => {
   //解析硬件版本
   let tempArr = JSON.parse(JSON.stringify(arrData))
   let arr =  tempArr.join('').match(/[a-z0-9][a-z0-9]/g)
   if (!arr ) {
       return
   }

   //去掉报头
   arr.shift()
   arr.shift()
   arr.shift()
   arr.shift()
   //去掉CRC
   arr.pop()
   arr.pop()
   //去掉报尾
   arr.pop()

   hardwareVersionArr = []
   sethardwareVersion(arr.map(i=>String.fromCharCode(parseInt(i, 16))).join(''))
   return arr.map(i=>String.fromCharCode(parseInt(i, 16))).join('')
  }


  const fetchStatus = (needAlert) => {
    if(needAlert){
      message.info('查询状态指令已发送',1)
    }
    setcurrentCMD('status')
    setTimeout(() => {
      send('7F1002061257')
    },0)
    
    setTimeout(() => {
      handleBatStatusArr(batStatusArr)
    }, 300);
    
  }
  const fetchHardwareVersion = () => {

    message.info('查询保护板硬件版本指令已发送',1)
    setcurrentCMD('hardwareVersion')
    setTimeout(() => {
      send('DDA50500FFFB77')
    }, 0)
    
    setTimeout(() => {
      console.log(`hardwareVersionArr`, hardwareVersionArr)
      handlehardwareVersionArr(hardwareVersionArr)
      
      console.log(`batStatusArr`, batStatusArr)
      console.log(`batSingleVArr`, batSingleVArr)
    }, 300);
    
  }
  const fetchSingleV = (needAlert) => {
    if(needAlert){

      message.info('查询单体电压指令已发送',1)
    }
    setcurrentCMD('singleV')
    setTimeout(() => {
      send('DDA50400FFFC77')
    },0)
    
    setTimeout(() => {
      console.log(`batSingleVArr`, batSingleVArr)
      handleBatSingleVArr(batSingleVArr)
      setpkey(pkey + 1)
    }, 300);
    
  }
  const setMOS = (code) => {
    
    message.info('控制MOS指令已发送',1)
    setcurrentCMD('mos')
    setTimeout(() => {
      switch (code) {
        case 0:
          send(`DD5AE1020000FF1D77`)
          break;
        case 1:
          send(`DD5AE1020101FF1C77`)
          break;
        case 2:
          send(`DD5AE1020202FF1B77`)
          break;
        case 3:
          send(`DD5AE1020303FF1A77`)
          break;
      
        default:
          break;
      }
      
    }, 1)
    
    
  }

  function handleChange(value) {
      setpath(value)
      setPort(new window.serialport(value, {
    
          baudRate: 9600, //波特率
  
          dataBits: 8, //数据位
  
          parity: 'none', //奇偶校验
  
          stopBits: 1, //停止位
  
          flowControl: false
  
        }, true))
        setTimeout(() => {
          // fetchHardwareVersion()
        }, 200);
        setTimeout(() => {
          fetchStatus(true)
        }, 700);
      console.log(`selected ${value}`);
    }

  function pipe(data) {
    if (!data) {
      return
    }
    console.log('dataStream', Buffer.from(data))
    const dataStream = Buffer.from(data).toString('hex')
    console.log('dataStream', dataStream)


    arr.push(<p className='text_left'>{
      // ab2Hex(data)
      dataStream
    }</p>)
    setMessageList([...arr])
    console.log('currentCMD', currentCMD)
    switch (currentCMD) {
      
      case 'hardwareVersion':
        hardwareVersionArr.push(dataStream)
        break;
      case 'status':
        if(dataStream.indexOf('7f')===-1){
          if(batStatusArr.length === 0) return
          batStatusArr[batStatusArr.length-1] = batStatusArr[batStatusArr.length-1] + dataStream
        }else{

          batStatusArr[0] = dataStream
        }
        break;
    
      default:
        break;
    }  
  }


  function portOnOpen() {
    port && port.on('open', function () {
      // open logic
      message.success(path+"端口开启成功！")
      console.log('端口已打开')
    })
  }


  function portOnData() {
    // port && port.on('readable', function () {
    //   console.log('Data:', port && port.read())
    // })
    port && port.on('data', function (data) {
      pipe(data)

    })
  }

  function send(msg) {
    if(!PORT){
      return
    }
    PORT.write(Buffer.from(msg, 'hex'), function (err) {
      
      arr.push(<p className='text_right'>{'发——>' + msg}</p>)
        setMessageList([...arr])
      

      if (err) {
        return console.log('Error on write: ', err.message)
      }
      console.log('message written')
    })
  }

    
    

  useEffect(() => {
    if (port) {
      PORT = port
      port && port.open(function (err) {
        if (err) {
          return console.log('Error opening port: ', err.message)
        }

        // Because there's no callback to write, write errors will be emitted on the port:
        console.log('端口已打开')
        port && port.write('main screen turn on')
      })


      portOnOpen()
      portOnData()
      // SingleVes the port into "flowing mode"

    }
  }, [port])

  useEffect(() => {
      let timer = setInterval(() => {
          window.serialport.list().then(ports => {
              setports(ports)
          });
        
        clearInterval(timer)
      }, 1000);
      // handlehardwareVersionArr(['DD','05','00','0a','30','31','32','33','34','35','36','37','38','39','fd','e9','77'])
      // setbatStatusObj(batStatusParse(['DD','03','00','1b','17','00','00','00','02','D0','03','e8','00','00','20','78','00','00','00','00','00','00','10','48','03','0f','02','0b','76','0b','82','fb','ff','77']))

      // setsingleVArr(
      //   singleVParse(['DD','04','00','1e','0f','66','0f','63','0f','63','0f','64','0f','3e','0f','63','0f','37','0f','5b','0f','65','0f','3b','0f','63','0f','63','0f','3c','0f','66','0f','2d','f9','f9','77'])
      // )
      
      console.log(`batStatusObj`, batStatusObj)
    }, [])
    useEffect(() => {
    
      console.log(`batStatusObj`, batStatusObj)
      console.log(`hardwareVersion`, hardwareVersion)
      console.log(`singleVArr`, singleVArr)
    }, [batStatusObj,hardwareVersion,singleVArr])

  

  return (<div>
      <Home page={page} callback={setpage} send={send} messageList={messageList} setLog={setLog} log={log}/>
      <BatDetail page={page} callback={setpage} batStatusObj={batStatusObj}  PORT={PORT} fetchStatus={fetchStatus} setMOS={setMOS} fetchSingleV={fetchSingleV} fetchHardwareVersion={fetchHardwareVersion}  handleChange={handleChange} ports={ports} hardwareVersion={hardwareVersion} singleVArr={singleVArr}/>
  </div>)

}

export default App;
