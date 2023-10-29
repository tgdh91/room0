import {creepConfigs} from '@/creepConfig'
import { values } from 'lodash'
export let spawnApi = {
    addTask(room, configName) { 
        // 任务加入队列
        if(!room.memory.spawnList) room.memory.spawnList = []
        if(room.memory.spawnList.length < 10)  room.memory.spawnList.push(configName)
        return room.memory.spawnList.length
    },
    checkCreep(tick){
        if(Game.time % tick == 0 && !Memory.rooms['E15N59'].spawnList.length){
            console.log('Start check number of creeps...')
            let creepNumber = Object.keys(Game.creeps).length
            let configNumber = _.sum(_.map(_.values(creepConfigs), 'number'))
            console.log(`Number of creeps: ${creepNumber}/${configNumber}`)
            if(creepNumber < configNumber) {
                for(let name in Memory.creeps) {
                    if(!Game.creeps[name]) {
                        this.addTask(_.values(Game.rooms)[0], Memory.creeps[name].configName)
                        delete Memory.creeps[name]
                    }
                }
                let configGroups = _.groupBy(Object.values(Game.creeps), 'memory.configName')
                //console.log(_.keys(configGroups))
                for(let configName in creepConfigs){
                    let len = configGroups[configName]?configGroups[configName].length:0
                    console.log(`${configName}: ${len}/${creepConfigs[configName].number}`)
                    while(creepConfigs[configName].number > len){
                        this.addTask(Object.values(Game.rooms)[0], configName)
                        len++
                        //console.log('人数不够 补充人数')
                    }
                }
            }
            console.log('Check finished.')   
        }   
    }
}