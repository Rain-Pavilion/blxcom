export function HEXto2(val) {
    //16进制转2进制
    return parseInt(val, 16).toString(2);

}

export function twoTo8two(c_Value) {
    //二进制转8位二进制
    let Point = [];
    if (c_Value.length < 8) {
        for (var j = 0; j < (8 - c_Value.length); j++) {
            Point.push('0')
        }
    }
    return Point.concat(c_Value.split('')); //或者return Point.reverse();对数组进行反向操作

}

export function twoTo16two(c_Value) {
    //二进制转16位二进制
    let Point = [];
    if (c_Value.length < 16) {
        for (var j = 0; j < (16 - c_Value.length); j++) {
            Point.push('0')
        }
    }
    return Point.concat(c_Value).join('');

}

export function toSettingAValue(value,scale) {
    const scales = {0: scale, 1: 5, 2: 100, 3: 5, 4: 10000, 5: 10000, 6: 10000, 7: 10000, 17:100, 18:100, 19:10, 20:10000, 
      21:10000, 30:10000, 31:10000, 32:10000, 33:10000, 34:10000, 36:10, 37:10}
    const signed = [8, 9, 10, 11, 15, 16, 22, 23, 24, 25, 26, 27]
    const byteN = {8:1, 9:1, 10:1, 11:1, 22:1, 23:1, 24:1, 25:1, 26:1, 27:1, 35:6, 38:1,39:1}
    const offsets = {}
  
    let settingAValue = [value].slice()

    // console.log(`settingAValue`, settingAValue,paramList,DataManager.settingA.length)
  
    let bytes = new Uint8Array(2)    // 注意长度需要准确相等，否则会以0填充
    let index = 0
  
    for (let i = 0; i < settingAValue.length; i++) {
      if (i in offsets) {
        settingAValue[i] -= offsets[i]
      }
  
      if (i in scales) {
        settingAValue[i] *= scales[i]
      } 
      // 满电电压有两种模式，如果小于6.5535V则视为单体电压,单位0.1mv
      if (i == 19 && settingAValue[i] < 65.535) settingAValue[i] *= 1000
  
      if (i in signed) {
        let value = settingAValue[i]
  
        if (byteN[i] == 1) {
          if (value < 0) {
            value += 256
          }
        } else if (byteN[i] == 2) {
          if (value < 0) {
            value += 65536
          }
        }
      }
  
      if (i in byteN) {
        if (byteN[i] == 6) {
          for (let j = 0; j < 3; j++) {
            bytes[index++] = settingAValue[i].charCodeAt(j)
          }
  
          let numVal = parseInt(settingAValue[i].substring(3))
          // console.log('deviceId numVal:', numVal)
  
          for (let j = 0; j < 3; j++) {
            bytes[index++] = (numVal >> ((2 - j) * 8)) & 0xff
          }
  
        } else if (byteN[i] == 4) {
          for (let j = 0; j < 4; j++) {
            bytes[index++] = (settingAValue[i] >> ((3 - j) * 8)) & 0xff
          }
        } else if (byteN[i] == 1) {
          bytes[index++] = settingAValue[i]
        }
      } else {
        bytes[index++] = settingAValue[i] >> 8
        bytes[index++] = settingAValue[i]
      }
    }
    
    const hexArr = Array.prototype.map.call(
        new Uint8Array(bytes.reverse()),
        function (byte) {
            return ('00' + byte.toString(16)).slice(-2)
        }
    )
    
    console.log(`bytes`, bytes)
    return hexArr.join('')
  }

// ArrayBuffer转16进度字符串示例
function ab2Hex(buffer) {
    const hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (byte) {
            return ('00' + byte.toString(16)).slice(-2)
        }
    )
    return hexArr.join('')
}

function charToByte(c) {
    return "0123456789ABCDEF".indexOf(c)
}

// 16进度字符串示例转ArrayBuffer
function hex2AB(hexStr) {
    if (hexStr) {
        let upperBytes = hexStr.toUpperCase();
        let len = upperBytes.length / 2;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = charToByte(upperBytes[2 * i]) << 4 | charToByte(upperBytes[2 * i + 1])
        }
        return bytes;
    }
    return null;
}
/**
 * 无符号8位字节转有符号16位
 * @param {number} byte 
 * @returns 
 */
function byte2SignedInt(byte) {
    if (byte > 127) {
        return byte - 256;
    } else {
        return byte;
    }
}
/**
 * 无符号双8位字节转有符号16位
 * @param {number} hB 
 * @param {number} lB 
 * @returns 
 */
function bytes2SignedInt(hB, lB) {
    let value = (hB << 8) | lB;
    if (value > 32767) value -= 65536;
    return value;
}
/**
 * 无符号双8位字节转无符号16位
 * @param {number} hB 
 * @param {number} lB 
 * @returns 
 */
function bytes2Int(hB, lB) {
    return (hB << 8) | lB;
}
/**
 * 无符号16位转有符号16位
 * @param {number} value 
 * @returns 
 */
function int2Signed(value) {
    return value > 32767 ? value - 65536 : value;
}

/**
 * 有符号字节转无符号（补码表示）
 * @param {number} value 
 */
function byte2Unsigned(value) {
    return value < 0 ? parseInt(value) + 256 : parseInt(value)
}

/**
 * 有符号整数转无符号整数（补码表示）
 * @param {number} value 
 */
function int2Unsigned(value) {
    return value < 0 ? parseInt(value) + 65536 : parseInt(value)
}
/**
 * 
 * @param {number} b4 MSB
 * @param {number} b3 
 * @param {number} b2 
 * @param {number} b1 LSB
 * @returns 
 */
function bytes2Uint32(b4, b3, b2, b1) {
    return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1
}




export const singleVParse = (arrData) => {

    //解析开过量量数据

    let arr = JSON.parse(JSON.stringify(arrData))
    if (!arr) {
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



    let singleVArr = arr.join('').match(/[a-z0-9]{4}/g).map(i => (parseInt(i, 16)) / 1000)



    return singleVArr
}

export const getCKS = (dataStr) => {
    let Arr = Buffer.from(dataStr, 'hex')
    let CKS = (256 - (Arr.reduce((prev,item)=>prev+item,0) & 0xff)).toString(16)
    let CMD = dataStr+CKS
    console.log("CKS+CMD: ",CKS,CMD)
    return [CKS,CMD]
}

export const batStatusParse = (arrData) => {

    //解析电池状态数据

    let arr = JSON.parse(JSON.stringify(arrData))
    

    if (arr[0] !== '7f' || arr ?.length !== parseInt(arr ?. [3], 16) || !arr) {
        return
    }
    console.log('batStatusParse', arr)
    console.log('ARR', arr.join(''))




    const batStatusObj = {}
    // console.log(`arr`, arr,Array.isArray(arr))

    //去掉报头
    arr.shift()
    arr.shift()
    arr.shift()
    arr.shift()
    arr.shift()
    //去掉CRC
    arr.pop()

    const bytes = hex2AB(arr.join(''))
    console.log(`arr`, arr, bytes)

    const bat_status_bit1 = [
        '充电电流',
        '充电过流',
        '',
        '',
        '放电电流',
        '放电过流',
        '放电短路',
        '',
    ]
    const bat_status_bit2 = [
        '电芯侦测线开路',
        '温感侦测线开路',
        '',
        '',
        '电芯过压',
        '电芯欠压',
        '电池组总压过高',
        '电池组总压过低',
    ]
    const bat_status_bit3 = [
        '',
        '',
        '电芯温度超过充电温度上限',
        '电芯温度超过放电温度上限',
        '电芯温度低于充电温度下限',
        '电芯温度低于放电温度下限',
        '电芯温差超过充电温度上限',
        '电芯温差超过放电温度上限',
    ]

    const bat_status_info = []

    const bat_status_bit1_arr = parseInt(arr[0], 16).toString(2) ?.split('') ?.reverse()
    const bat_status_bit2_arr = parseInt(arr[1], 16).toString(2) ?.split('') ?.reverse()
    const bat_status_bit3_arr = parseInt(arr[2], 16).toString(2) ?.split('') ?.reverse()
    const bat_status_bit4_arr = parseInt(arr[3], 16).toString(2) ?.split('') ?.reverse() //第 4 字节，保留。
    bat_status_bit1.forEach((item, index) => {
        if (bat_status_bit1_arr[index] === '1') {
            bat_status_info.push(item)
        }
        return true
    })
    bat_status_bit2.forEach((item, index) => {
        if (bat_status_bit2_arr[index] === '1') {
            bat_status_info.push(item)
        }
        return true
    })
    bat_status_bit3.forEach((item, index) => {
        if (bat_status_bit3_arr[index] === '1') {
            bat_status_info.push(item)
        }
        return true
    })

    console.log('bat_status_info', bat_status_info)

    //[16, 0, 0, 0, 0, 0, 92, 0, 4, 0, 13, 6, 13, 0, 13, 8, 13, 0, 1, 21, 1, 21, 0, 0, 183, 0, 144, 1, 192]

    batStatusObj.bat_status_info = bat_status_info
    batStatusObj.charge_ah = bytes2SignedInt(bytes[5], bytes[4]) / 10 //充电电流
    batStatusObj.discharge_ah = bytes2SignedInt(bytes[7], bytes[6]) / 10 //放电电流
    batStatusObj.bat_number = parseInt(arr[8], 16) //电池串数

    const v_arr = arr.slice(9, 9 + batStatusObj.bat_number * 2).join('').match(/[a-z0-9]{4}/g).map(i => i.match(/[a-z0-9]{2}/g).reverse())
    let v_arrs = v_arr.map(i => hex2AB(i.join(''))).map(i => bytes2Int(i[0], i[1]) / 1000)

    batStatusObj.v_arrs = v_arrs //电芯电压

    let equilibrium_state_data;

    let offset;

    if (batStatusObj.bat_number <= 8) {
        equilibrium_state_data = arr.slice(9 + batStatusObj.bat_number * 2, 9 + batStatusObj.bat_number * 2 + 1)
        offset = 9 + batStatusObj.bat_number * 2 + 1
    } else if (batStatusObj.bat_number <= 16) {
        equilibrium_state_data = arr.slice(9 + batStatusObj.bat_number * 2, 9 + batStatusObj.bat_number * 2 + 2)
        offset = 9 + batStatusObj.bat_number * 2 + 2
    } else if (batStatusObj.bat_number <= 24) {
        equilibrium_state_data = arr.slice(9 + batStatusObj.bat_number * 2, 9 + batStatusObj.bat_number * 2 + 3)
        offset = 9 + batStatusObj.bat_number * 2 + 3
    } else if (batStatusObj.bat_number <= 32) {
        equilibrium_state_data = arr.slice(9 + batStatusObj.bat_number * 2, 9 + batStatusObj.bat_number * 2 + 4)
        offset = 9 + batStatusObj.bat_number * 2 + 4
    }

    let equilibrium_state_info = equilibrium_state_data.map(i => twoTo8two(i))

    console.log('equilibrium_state_data', equilibrium_state_data,equilibrium_state_info)

    batStatusObj.equilibrium_state = equilibrium_state_info //平衡状态

    batStatusObj.temperature_sensing_number = parseInt(arr[offset], 16) //电芯温感个数
    batStatusObj.temperature_sensing = arr.slice(offset+1,offset+1+batStatusObj.temperature_sensing_number).map(i=>parseInt(i, 16)) //电芯温感
    offset = offset+1+batStatusObj.temperature_sensing_number
    batStatusObj.MOSFET_t_sensing_number = parseInt(arr[offset], 16) //MOSFET 温感个数
    batStatusObj.MOSFET_t_sensing = arr.slice(offset+1,offset+1+batStatusObj.MOSFET_t_sensing_number).map(i=>parseInt(i, 16)) //MOSFET 温感
    offset = offset+1+batStatusObj.MOSFET_t_sensing_number
    batStatusObj.cycles  = bytes2Int(bytes[offset+1], bytes[offset])
    batStatusObj.soc  = bytes2Int(bytes[offset+3], bytes[offset+2]) / 10 //剩余电量
    console.log('first', bytes[offset+5])
    batStatusObj.total_soc  = bytes2Int(bytes[offset+5], bytes[offset+4]) / 10 //总容量
    batStatusObj.MOSFET_status  = arr[offset+6]
    return batStatusObj
}