import { mountCreep } from "./mount.creep"
import { mountSpawn } from "./mount.spawn"
// const mountFlag = require('./mount.flag')
// const mountRoom = require('./mount.room')

// 挂载所有的额外属性和方法
export function mount() {
    console.log('[mount] 重新挂载拓展')

    mountCreep()
    mountSpawn()
    // mountFlag()
    // mountRoom()
    // 其他更多拓展...
}