'use strict';

/**
 * 升级者配置生成器
 * source: 从指定矿中挖矿
 * target: 将其转移到指定的 roomController 中
 *
 * @param sourceId 取出能量 id
 */
var roleUpgrader = sourceId => ({
    // 采集能量矿
    /**
     *
     * @param {Creep} creep
     * @returns {boolean}
     */
    source: creep => {
        const source = Game.getObjectById(sourceId);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE)
            creep.moveTo(source);
        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0;
    },
    // 升级控制器
    target: creep => {
        const controller = creep.room.controller;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
            creep.moveTo(controller);
        // 自己身上的能量没有了，返回 true（切换至 source 阶段）
        return creep.store[RESOURCE_ENERGY] <= 0;
    }
});

/**
 * 矿工配置生成器
 * source: 从指定矿中挖矿
 * target: 将其转移到指定的 roomController 中
 *
 * @param sourceId 要挖的矿 id
 * @param targetId
 */
var roleHarvester = (sourceId, targetId) => ({
    // 采集能量矿
    /**
     *
     * @param {Creep} creep
     * @returns {boolean}
     */
    source: creep => {
        const source = Game.getObjectById(sourceId);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE)
            creep.moveTo(source);
        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0;
    },
    // 存放能量
    target: creep => {
        const target = Game.getObjectById(targetId);
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);
        // 自己身上的能量没有了，返回 true（切换至 source 阶段）
        return creep.store[RESOURCE_ENERGY] <= 0;
    }
});

/**
 * 建造者配置生成器
 * source: 从指定矿中挖矿
 * target: 将其转移到指定的 roomController 中
 *
 * @param sourceId 要挖的矿 id
 */
var roleBuilder = (sourceId) => ({
    // 采集能量矿
    /**
     *
     * @param {Creep} creep
     * @returns {boolean}
     */
    source: creep => {
        const source = Game.getObjectById(sourceId);
        if (creep.withdraw(source) == ERR_NOT_IN_RANGE)
            creep.moveTo(source);
        // 自己身上的能量装满了，返回 true（切换至 target 阶段）
        return creep.store.getFreeCapacity() <= 0;
    },
    // 开始建造
    target: creep => {
        const target = creep.room.find(FIND_MY_CONSTRUCTION_SITES)[0];
        if (creep.build(target) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);
        // 自己身上的能量没有了，返回 true（切换至 source 阶段）
        return creep.store[RESOURCE_ENERGY] <= 0;
    }
});

var creepConfigs = {
    harvester1: {
        role: 'harvester',
        body: [WORK, CARRY, MOVE],
        number: 2,
        args: ['5bbcadc79099fc012e637d6a', '653bad3f94bd2214aabd7582']
    },
    upgrader1: {
        role: 'upgrader',
        body: [WORK, CARRY, MOVE],
        number: 5,
        args: ['5bbcadc79099fc012e637d6c', '5bbcadc79099fc012e637d6b']
    },
    builder1: {
        role: 'builder',
        body: [WORK, CARRY, MOVE],
        number: 1,
        args: ['5bbcadc79099fc012e637d6a']
    }
};

let creepApi = {
    /**
     * 新增 creep 配置项
     * @param configName 配置项名称
     * @param role 该 creep 的角色
     * @param args creep 的工作参数
     */
    // add(configName, role, ...args) {
    //     if (!Memory.creepConfigs) Memory.creepConfigs = {}
    //     Memory.creepConfigs[configName] = { role, args }
    //     return `${configName} 配置项已更新：[角色] ${role} [工作参数] ${args}`
    // },
    // /**
    //  * 移除指定 creep 配置项
    //  * @param configName 要移除的配置项名称
    //  */
    // remove(configName) {
    //     delete Memory.creepConfigs[configName]
    //     return `${configName} 配置项已移除`
    // },
    /**
     * 获取 creep 配置项
     * @param configName 要获取的配置项名称
     * @returns 对应的配置项，若不存在则返回 undefined
     */
    get(configName) {
        return creepConfigs[configName];
    }
};

function mountCreep() {
    _.assign(Creep.prototype, creepExtension);
}
/**
 * 引入 creep 配置项
 * 其键为角色名（role），其值为对应角色的逻辑生成函数
 */
const roles = {
    upgrader: roleUpgrader,
    harvester: roleHarvester,
    builder: roleBuilder
};
const creepExtension = {
    // 添加 work 方法
    work() {
        // ------------------------ 第一步：获取 creep 执行逻辑 ------------------------
        // 获取对应配置项
        const myConfig = creepApi.get(this.memory.configName);
        // console.log('myConfig:'+ myConfig)
        // 检查 creep 内存中的配置是否存在
        if (!myConfig) {
            console.log(`creep ${this.name} 携带了一个无效的配置项 ${this.memory.configName}`);
            this.say('找不到配置！');
            return;
        }
        const creepLogic = roles[myConfig.role](...myConfig.args);
        // ------------------------ 第二步：执行 creep 准备阶段 ------------------------
        // 没准备的时候就执行准备阶段
        if (!this.memory.ready) {
            // 有准备阶段配置则执行
            if (creepLogic.prepare) {
                this.memory.ready = creepLogic.prepare(this);
            }
            // 没有就直接准备完成
            else
                this.memory.ready = true;
            return;
        }
        // ------------------------ 第三步：执行 creep 工作阶段 ------------------------
        let stateChange = true;
        // 执行对应阶段
        // 阶段执行结果返回 true 就说明需要更换 working 状态
        if (this.memory.working) {
            if (creepLogic.target)
                stateChange = creepLogic.target(this);
        }
        else {
            if (creepLogic.source)
                stateChange = creepLogic.source(this);
        }
        // 状态变化了就切换工作阶段
        if (stateChange)
            this.memory.working = !this.memory.working;
        // ------------------------ 第四步：执行 creep 健康检查 ------------------------
        // 如果 creep 还没有发送重生信息的话，执行健康检查，保证只发送一次生成任务
        // 健康检查不通过则向 spawnList 发送自己的生成任务
        // if (this.ticksToLive == creepConfigs[this.memory.configName].body.length * 3) {
        //     spawnApi.addTask(this.room, this.memory.configName)
        // }
    }
};

function mountSpawn() {
    _.assign(StructureSpawn.prototype, spawnExtension);
}
const spawnExtension = {
    // 添加 work 方法
    work() {
        // 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
        if (this.spawning || !this.room.memory.spawnList || this.room.memory.spawnList.length == 0) {
            //console.log('没有')
            return;
        }
        // 进行生成
        //console.log(this.room.memory.spawnList[0])
        const spawnSuccess = this.mainSpawn(this.room.memory.spawnList[0]);
        //console.log('spawnCreep success')
        // 生成成功后移除任务
        if (spawnSuccess)
            this.room.memory.spawnList.shift();
    },
    mainSpawn(configName) {
        let creepName = configName + '_' + Game.time;
        if (this.spawnCreep(creepConfigs[configName].body, creepName, { memory: { configName: configName } }) == 0) {
            console.log(`生成Creep: ${creepName}, body: ${creepConfigs[configName].body}`);
            return true;
        }
    }
};

// const mountFlag = require('./mount.flag')
// const mountRoom = require('./mount.room')
// 挂载所有的额外属性和方法
function mount() {
    console.log('[mount] 重新挂载拓展');
    mountCreep();
    mountSpawn();
    // mountFlag()
    // mountRoom()
    // 其他更多拓展...
}

let spawnApi = {
    addTask(room, configName) {
        // 任务加入队列
        if (!room.memory.spawnList)
            room.memory.spawnList = [];
        if (room.memory.spawnList.length < 10)
            room.memory.spawnList.push(configName);
        return room.memory.spawnList.length;
    },
    checkCreep(tick) {
        if (Game.time % tick == 0 && !Memory.rooms['E15N59'].spawnList.length) {
            console.log('Start check number of creeps...');
            let creepNumber = Object.keys(Game.creeps).length;
            let configNumber = _.sum(_.map(_.values(creepConfigs), 'number'));
            console.log(`Number of creeps: ${creepNumber}/${configNumber}`);
            if (creepNumber < configNumber) {
                for (let name in Memory.creeps) {
                    if (!Game.creeps[name]) {
                        this.addTask(_.values(Game.rooms)[0], Memory.creeps[name].configName);
                        delete Memory.creeps[name];
                    }
                }
                let configGroups = _.groupBy(Object.values(Game.creeps), 'memory.configName');
                //console.log(_.keys(configGroups))
                for (let configName in creepConfigs) {
                    let len = configGroups[configName] ? configGroups[configName].length : 0;
                    console.log(`${configName}: ${len}/${creepConfigs[configName].number}`);
                    while (creepConfigs[configName].number > len) {
                        this.addTask(Object.values(Game.rooms)[0], configName);
                        len++;
                        //console.log('人数不够 补充人数')
                    }
                }
            }
            console.log('Check finished.');
        }
    }
};

// 挂载 creep 管理模块
//require('creepApi.js')
// 挂载 creep 拓展
mount();
Memory.rooms['E15N59'].spawnList = [];
spawnApi.checkCreep(1);
module.exports.loop = function () {
    // 遍历所有 creep 并执行上文中拓展的 work 方法
    spawnApi.checkCreep(50);
    Object.values(Game.creeps).forEach(creep => creep.work());
    Object.values(Game.spawns).forEach(spawn => spawn.work());
};
//# sourceMappingURL=main.js.map
