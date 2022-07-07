import React, { useState, useRef, useEffect } from 'react';
import { Statistic, Row, Col, Select, Progress, Tooltip, Switch, Button } from 'antd';
import './index.css';
import { ReloadOutlined, UsbOutlined } from '@ant-design/icons';


const { Option } = Select;

const projectText = [
    '过充保护',
    '过放保护',
    '过温保护',
    '低温保护',
    '充电过流保护',
    '放电过流保护'
]



const { ipcRenderer } = window;

function BatDetail({ page, callback, PORT, handleChange, ports, batStatusObj, fetchStatus }) {
    // 页面上的提示信息
  const [text, setText] = useState('');
  // 当前应用版本信息
  const [version, setVersion] = useState('0.0.0');
  // 当前下载进度
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 给主进程发通知，让主进程告诉我们当前应用的版本是多少
    ipcRenderer.send('checkAppVersion');
    // 接收主进程发来的通知，检测当前应用版本
    ipcRenderer.on('version', (event, version) => {
      console.log("version",version) // Prints 'whoooooooh!'
      setVersion(version);
    })
    // ipcRenderer.on("version", (version) => {
    //   setVersion(version);
    // });

    // 给主进程发通知，检测当前应用是否需要更新
    ipcRenderer.send('checkForUpdate');
    // 接收主进程发来的通知，告诉用户当前应用是否需要更新
    ipcRenderer.on('message', (event, data) => {
      setText(data);
    });
    // 如果当前应用有新版本需要下载，则监听主进程发来的下载进度
    ipcRenderer.on('downloadProgress', (event, data) => {
      const progress = parseInt(data.percent, 10);
      setProgress(progress);
    });
  }, []);

    const [key, setkey] = useState(0)
    const [isInterval, setisInterval] = useState(true)
    let timer = useRef()


    useEffect(() => {
        // console.log(`isInterval`, isInterval)
        if (isInterval) {
            timer.current = setInterval(() => {
                console.log(`111`, 111)
                fetchStatus()
            }, 1500)
        }
        if (!isInterval) {
            clearInterval(timer.current)
        }
    }, [isInterval])





    return (
        <Row style={{ display: page === 'BatDetail' ? 'flex' : 'none' }}>
            <Col className='left_tab'>

                <Tooltip placement="right" title={'查询电池状态'}>

                    <img src={require('../query.svg')} style={{ color: '#fff', width: 20, height: 20, margin: '20px auto' }} onClick={() => {


                        setTimeout(() => {
                            fetchStatus(true)
                        }, 500);
                        setkey(key + 1)

                    }} />
                </Tooltip>

                <Tooltip placement="right" title={'串口调试信息'}>
                    <UsbOutlined style={{ color: '#fff', margin: '20px auto' }} onClick={() => {
                        callback('home')
                    }} />
                </Tooltip>
                <Tooltip placement="right" title={'重启程序'}>
                    <ReloadOutlined style={{ color: '#fff', margin: '20px auto' }} onClick={() => {
                        window.location.reload()

                    }} />
                </Tooltip>

            </Col>
            <Col className='right_content'>
                <Row gutter={16}>

                    <Col span={8}>
                        <Row className='left_main'>
                            <Col>
                                <Select placeholder='请先选择端口' bordered={false} style={{ width: 130, marginTop: '20px' }} onChange={handleChange}>
                                    {
                                        ports.map(port => {
                                            return <Option value={port.path}>{port.path}</Option>
                                        })

                                    }
                                </Select>
                            </Col>

                            <Progress style={{ marginTop: '60px' }} type="circle" percent={((batStatusObj?.soc / batStatusObj?.total_soc) * 100).toFixed(2) ?? 0} />
                            <h3 style={{ marginTop: '20px' }}>电量</h3>

                            <div style={{ marginTop: '20px',maxWidth: '80%', wordBreak: 'break-all' }}>
                                <p>当前app版本: {version}</p>
                                <p>{text}</p>
                                {progress ? <p>下载进度：{progress}%</p> : null}
                            </div>
                        </Row>

                    </Col>
                    <Col span={16}>
                        <Row className='right_main'>
                            {/* <Col style={{color:'#000'}} span={23} offset={1}>
                                实时刷新：<Switch   onChange={val=>{
                                    console.log(`val`, val)
                                    setisInterval(val)}}/>
                            </Col> */}
                            <Col className='voltage' span={7} offset={1}>
                                <Statistic title="放电电流" value={batStatusObj?.discharge_ah} suffix="A" />
                            </Col>
                            <Col className='charge_electricity' span={7} offset={1}>
                                <Statistic title="充电电流" value={batStatusObj?.charge_ah} suffix="A" />
                            </Col>
                            <Col className='discharge_electricity' span={7} offset={1}>
                                <Statistic title="电池串数" value={batStatusObj?.bat_number} />
                            </Col>
                            <Col className='Ah' span={7} offset={1}>
                                <Statistic title="剩余容量" value={batStatusObj?.soc} suffix="ah" />
                            </Col>
                            <Col className='days' span={7} offset={1}>
                                <Statistic title="总容量" value={batStatusObj?.total_soc} suffix="ah" />
                            </Col>
                            <Col className='charge_electricity' span={7} offset={1}>
                                <Statistic title="循环次数" value={batStatusObj?.cycles} />
                            </Col>
                            <Col className='days' span={23} offset={1}>
                                <Statistic title="电池状态" value={batStatusObj?.bat_status_info?.toString()} />
                            </Col>
                            {
                                batStatusObj?.v_arrs?.map((i, index) => {
                                    return <Col className='bat_pitch' span={4} offset={1}>
                                        <Statistic title={"电芯" + (index + 1)} value={i} />
                                    </Col>
                                })


                            }

                            <Col span={23} offset={1} >
                                <span style={{ color: '#000', marginRight: 20 }}>电芯温感</span>
                            </Col>
                            {
                                batStatusObj?.temperature_sensing?.map((i, index) => {
                                    return <Col className='charge_electricity' span={5} offset={1}>
                                        <Statistic title={"电芯" + (index + 1)} value={i} suffix="℃" />
                                    </Col>
                                })


                            }
                            <Col span={23} offset={1} >
                                <span style={{ color: '#000', marginRight: 20 }}>MOSFET 温感</span>
                            </Col>
                            {
                                batStatusObj?.MOSFET_t_sensing?.map((i, index) => {
                                    return <Col className='charge_electricity' span={5} offset={1}>
                                        <Statistic title={"电芯" + (index + 1)} value={i} suffix="℃" />
                                    </Col>
                                })


                            }

                            <Col className='voltage' span={23} offset={1}>
                                <p>平衡状态</p>
                                <p style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {(() => {
                                        if (batStatusObj?.equilibrium_state?.flat().includes('1')) {
                                            return batStatusObj?.equilibrium_state?.flat()?.map((item, index) => {
                                                return <span style={{ width: 120 }}>
                                                    串{index + 1}: <Switch checkedChildren="1" unCheckedChildren="0" checked={+item} />
                                                </span>
                                            })
                                        } else {
                                            return '未开启平衡'
                                        }
                                    })()}

                                </p>

                            </Col>
                            <br></br>


                        </Row>
                    </Col>



                </Row>
            </Col>
        </Row>

    )
}

export default BatDetail
