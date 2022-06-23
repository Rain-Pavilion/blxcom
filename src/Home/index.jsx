import React, { useState, useEffect } from 'react';
import { Button, Select, Input, message, Row, Col, Tooltip } from 'antd';
import 'antd/dist/antd.css';

import { ReloadOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';


const { Option } = Select;
const { TextArea } = Input;
export let arr = [];
export let PORT;
export let hardwareVersion = ''//保护板硬件版本
export let batStatusArr = []; //状态信息
export let batSingleVArr = []; //开关量


function Home({ page, callback ,send,messageList,setLog,log}) {
  const [text, setText] = useState()


  








  useEffect(() => {
    var msglist = document.getElementById('msglist');
    msglist.scrollTop = msglist.scrollHeight;

  }, [messageList])







  return (
    <Row style={{ display: page === 'home' ? 'block' : 'none' }}>
      <Col className='left_tab'>
        <Tooltip placement="right" title={'电池状态'}>
          <HomeOutlined style={{ color: '#fff',width:20,height:20, margin: '20px auto' }}
            onClick={() => {
              
              callback('BatDetail')
            }} />
        </Tooltip>


        <Tooltip placement="right" title={'重启程序'}>
          <ReloadOutlined style={{ color: '#fff', margin: '20px auto' }} onClick={() => {
            window.location.reload()
          }} />
        </Tooltip>


      </Col>
      <Col className='right_content'>
        <div >

          <main className='scrollbar' id='msglist'>
            {
              messageList.map(item => item)
            }
          </main>
          <footer>
            {
              log?<Button onClick={() => {
                setLog(false)
              }}>停止打印</Button>:
              <Button onClick={() => {
                setLog(true)
              }}>开始打印</Button>
            }
            {/* <Button onClick={() => {
              setLog()
            }}>停止打印</Button> */}
            <Button onClick={() => {
              send(text)
            }}>发送</Button>
            <TextArea onChange={(e)=>{
              // console.log(`object`, e.target.value)
              setText(e.target.value)
            }} onPressEnter={(e) => {
                  send(e.target.value)
            }} rows={4} />
          </footer>
        </div>

      </Col>
    </Row>

  );
}

export default Home;
