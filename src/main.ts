import {mount} from './modules/mount'
import {creepApi} from './modules/creepApi'
import {spawnApi} from './modules/spawnApi'

// 挂载 creep 管理模块
//require('creepApi.js')
// 挂载 creep 拓展
mount()
Memory.rooms['E15N59'].spawnList = []
spawnApi.checkCreep(1)

module.exports.loop = function() {
    // 遍历所有 creep 并执行上文中拓展的 work 方法
    spawnApi.checkCreep(50)
    Object.values(Game.creeps).forEach(creep => creep.work())
    Object.values(Game.spawns).forEach(spawn => spawn.work())
    
}