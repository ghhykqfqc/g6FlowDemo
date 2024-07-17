const stateFlowList = [
    {
        "branchList": [
            [
                {
                    "componentGroupNumber": "G01",
                    "componentGroupDesc":"检查组1"
                }
            ]
        ]
    },
    {
        "branchList": [
            [
                {
                    "componentGroupNumber": "G02",
                    "componentGroupDesc":"检查组2"
                },
                {
                    "branchList": [
                        [
                            {
                                "componentGroupNumber": "G03",
                                "componentGroupDesc":"检查组3"
                            },
                            {
                                "componentGroupNumber": "G04",
                                "component GroupDesc":"检查组4"
                            }
                        ]
                    ]
                },
                {
                    "componentGroupNumber": "G05",
                    "componentGroupDesc":"检查组5"
                }
            ],
            [
                {
                    "componentGroupNumber": "G06",
                    "componentGroupDesc":"检查组6"
                },
                {
                    "branchList": [
                        [
                            {
                                "componentGroupNumber": "G07",
                                "componentGroupDesc":"检查组7"
                            },
                            {
                                "componentGroupNumber": "G08",
                                "componentGroupDesc":"检查组8"
                            }
                        ],
                        [
                            {
                                "componentGroupNumber": "G09",
                                "componentGroupDesc":"检查组9"
                            },
                            {
                                "componentGroupNumber": "G10",
                                "component GroupDesc":"检查组10"
                            }
                        ],
                        [
                            {
                                "componentGroupNumber": "G11",
                                "componentGroupDesc":"检查组11"
                            },
                            {
                                "componentGroupNumber": "G12",
                                "component GroupDesc":"检查组12"
                            }
                        ]
                    ]
                }
            ]
        ]
    },
    {
        "branchList": [
            [
                {
                    "componentGroupNumber": "G13",
                    "component GroupDesc":"检查组13"
                },
                {
                    "componentGroupNumber": "G14",
                    "component GroupDesc":"检查组14"
                },
                {
                    "componentGroupNumber": "G15",
                    "component GroupDesc":"检查组15"
                }
            ]
        ]
    }
]

// const stateFlowList = [
//     {
//         "branchList": [
//             [
//                 {
//                     "componentGroupNumber": "G01",
//                     "componentGroupDesc":"检查组1"
//                 }
//             ]
//         ]
//     },
//     {
//         "branchList": [
//             [
//                 {
//                     "componentGroupNumber": "G02",
//                     "componentGroupDesc":"检查组2"
//                 },
//                 {
//                     "componentGroupNumber": "G03",
//                     "component GroupDesc":"检查组3"
//                 },
//                 {
//                     "componentGroupNumber": "G04",
//                     "componentGroupDesc":"检查组4"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G05",
//                     "component GroupDesc":"检查组5"
//                 }
//             ]
//         ]
//     },
//     {
//         "branchList": [
//             [
//                 {
//                     "componentGroupNumber": "G06",
//                     "component GroupDesc":"检查组6"
//                 }
//             ]
//         ]
//     }
// ]

// const stateFlowList = [
//     {
//         "branchList": [
//             [
//                 {
//                     "componentGroupNumber": "G01",
//                     "componentGroupDesc":"检查组1"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G02",
//                     "componentGroupDesc":"检查组2"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G02",
//                     "componentGroupDesc":"检查组2"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G03",
//                     "componentGroupDesc":"检查组3"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G04",
//                     "componentGroupDesc":"检查组4"
//                 }
//             ],
//             [
//                 {
//                     "componentGroupNumber": "G05",
//                     "component GroupDesc":"检查组5"
//                 }
//             ]
//         ]
//     }
// ]

function extractNodesAndEdges(stateFlowList) {
    const nodes = [];
    const edges = [];
    let prevId = ''; // 边的前置节点
    let nextId = ''; // 边的后置接点

    function traverse(flowList) {
        flowList.forEach((item, index) => { // item(或含branch)之间串行
            let branchList = item.branchList || item;
            if(Array.isArray(branchList) && branchList.length > 0) {
                branchList.forEach(childList => { // branchList每一个childList之间都是线性链接
                    if(childList.length > 0) {
                        nextId = getFirstId(childList); // 当前childList的第一个节点衔接上个分支末节点
                        if(prevId && nextId) {
                            if(flowList[index-1] !== undefined) { // 存在上个分支
                                let lastBranch = flowList[index-1].branchList || flowList[index-1];
                                getEdgesFromLastBranch(lastBranch, nextId);
                            }
                        }
                        prevId = nextId; // 前置节点更新
                        traverse(childList);
                    }
                })
            } else if(branchList.componentGroupNumber !== undefined) {
                nodes.push(item);
                nextId = item.componentGroupNumber;
                if(prevId && prevId !== nextId) {
                    edges.push({
                        source: prevId,
                        target: nextId
                    })
                    prevId = nextId; // 前置节点更新
                }
            } else {
                console.log('当前节点或链路存在问题-------->', branchList)
            }
        });
    }

    function getEdgesFromLastBranch(lastBranch, nextId) {
        if(Array.isArray(lastBranch) && lastBranch.length > 0) { // 上个分支含branchList
            lastBranch.forEach(lBranch => {
                if(Array.isArray(lBranch) && lBranch.length > 0) {
                    lBranch = lBranch.slice(-1); // 取lBranch数组的最后一项
                }
                getEdgesFromLastBranch(lBranch, nextId);
            });
        }else if(lastBranch.branchList !== undefined) { // 上个链路最后为一个branchList
            getEdgesFromLastBranch(lastBranch.branchList, nextId);
        } else if(lastBranch.componentGroupNumber !== undefined) { // 上个分支本身即为节点
            edges.push({
                source: lastBranch.componentGroupNumber,
                target: nextId
            })
        } else {
            console.log('上个节点或链路存在问题-------->', lastBranch)
        }
    }

    function getFirstId(branch) { // 深度提取branchList的首节点
        if(Array.isArray(branch) && branch.length > 0) { // 如果为数组且内层套了branchList
            let firstChild = branch[0].branchList || branch[0];
            return getFirstId(firstChild);
        } else if(branch.componentGroupNumber !== undefined) { // 如果为node对象
            return branch.componentGroupNumber;
        } else { // 如果没有找到节点，返回初始值空字符串
            return '';
        }
    }
    traverse(stateFlowList);
    return { nodes, edges };
}
console.log('stateFlowList-------->', stateFlowList);
const groupInfo = extractNodesAndEdges(stateFlowList);


function transInfo2FlowList(groupInfo) {
    const { nodes, edges } = groupInfo;
    // 初始化 flowList 数组
    var flowList = [];
    if(nodes.length === 0) { // 无节点
        console.log('该流程暂未配置节点-------->', groupInfo);
    } else if(nodes.length > 0 && edges.length === 0) { // 有节点无边
        let branchList = [];
        nodes.forEach(node => {
            branchList.push([node]);
        });
        flowList = [{
            "branchList": branchList
        }]
    } else if(nodes.length > 0 && edges.length > 0) {
        console.log('初始edges-------->', edges)
        // 创建一个映射，以节点的 componentGroupNumber 为键，节点对象为值
        const nodeMap = new Map(nodes.map(node => [node.componentGroupNumber, node]));
        const beginNodeId = edges[0].source;
        flowList = getFlowListFromEdges(edges); // 递归求解

        function getNextBranchList(sameStartSourceEdges, childBranchMap, callback) {
            let nextBranchList = [];
            sameStartSourceEdges.forEach(sssEdge => {
                if(childBranchMap.get(sssEdge.target)) {
                    let flist = callback(childBranchMap.get(sssEdge.target)); // 调用getFlowListFromEdges
                    nextBranchList.push(flist);
                } else {
                    nextBranchList.push([nodeMap.get(sssEdge.target)]);
                }
            });
            return nextBranchList;
        }

        function getFlowListFromEdges(edges) { // edges.length > 0
            let fList = [];
            // 根据 edges 构建父子关系
            const startSourceId = edges[0].source; // 获取第一个元素的 source 值
            const endTargetId = edges[edges.length-1].target;
            const lastIndex = findLastIndex(edges, 'source', startSourceId); // 大于0说明firstSource节点指向多条边
            if(startSourceId === beginNodeId) { // 第一层起始节点为单独branchList
                fList.push({
                    branchList: [[nodeMap.get(startSourceId)]]
                })
                if(lastIndex === 0) { // firstSource指向一条链路
                    if(edges.length > 1) {
                        fList = fList.concat(getFlowListFromEdges(edges.slice(1)));
                    } else {
                        fList.push(nodeMap.get(endTargetId));
                    }
                } else { // firstSource指向多条链路
                    let childBranchMap = new Map(); // key = 分支链路起始节点id，value = 分支链路边数组
                    let prevSameIndex = -1;
                    let sameStartSourceEdges = [];
                    let sameEndTargetEdges = [];
                    edges.forEach((edge, index) => {
                        if(edge.source === startSourceId) {
                            sameStartSourceEdges.push(edge);
                            if(index > 0) {
                                childBranchMap.set(edges[prevSameIndex+1].source, edges.slice(prevSameIndex+1, index));
                            }
                            prevSameIndex = index;
                        } else if(edge.target === endTargetId && edges[index-1].target !== endTargetId) {
                            if(index < edges.length - 1) { // 指向最后一个节点的边存在
                                sameEndTargetEdges = edges.slice(index, edges.length);
                                console.log('sameEndTargetEdges-------->', sameEndTargetEdges)
                            }
                            if(index > prevSameIndex + 1) { // 最后一个并行分支的节点存在
                                childBranchMap.set(edges[prevSameIndex+1].source, edges.slice(prevSameIndex+1, index));
                            }
                        }
                    });
                    let nextBranchList = getNextBranchList(sameStartSourceEdges, childBranchMap, getFlowListFromEdges);
                    if(nextBranchList) {
                        fList.push({
                            branchList: nextBranchList
                        })
                    }
                    fList.push({
                        branchList: [[nodeMap.get(endTargetId)]]
                    })
                }
            } else {
                fList.push(nodeMap.get(startSourceId))
                if(lastIndex === 0) { // firstSource指向一条链路
                    if(edges.length > 1) {
                        fList = fList.concat(getFlowListFromEdges(edges.slice(1)));
                    } else {
                        fList.push(nodeMap.get(endTargetId));
                    }
                } else { // firstSource指向多条链路
                    var childBranchMap = new Map(); // key = 分支链路起始节点id，value = 分支链路边数组
                    var prevSameIndex = -1;
                    var sameStartSourceEdges = [];
                    var sameEndTargetEdges = [];
                    edges.forEach((edge, index) => {
                        if(edge.source === startSourceId) {
                            sameStartSourceEdges.push(edge);
                            if(index > 0) {
                                childBranchMap.set(edges[prevSameIndex+1].source, edges.slice(prevSameIndex+1, index));
                            }
                            prevSameIndex = index;
                        } else if(edge.target === endTargetId && edges[index-1].target !== endTargetId) { // 边数组第一个指向endTarget的项(边)
                            if(edges[index-1].target === edge.source) { // 此边虽指向endTarget 却属于前一小分支
                                if(index > prevSameIndex) { // 最后一个并行分支的节点存在
                                    childBranchMap.set(edges[prevSameIndex+1].source, edges.slice(prevSameIndex+1, index+1));
                                }
                                if(index+1 < edges.length) { // 指向最后一个节点的边存在
                                    sameEndTargetEdges = edges.slice(index+1, edges.length);
                                }
                            } else { // 此边不属于前一小分支 为分支结束分界标记
                                if(index > prevSameIndex + 1) { // 最后一个并行分支的节点存在
                                    childBranchMap.set(edges[prevSameIndex+1].source, edges.slice(prevSameIndex+1, index));
                                }
                                if(index < edges.length) { // 指向最后一个节点的边存在
                                    sameEndTargetEdges = edges.slice(index, edges.length);
                                }
                            }
                        }
                    });
                    let nextBranchList = getNextBranchList(sameStartSourceEdges, childBranchMap, getFlowListFromEdges);
                    if(nextBranchList) {
                        fList.push({
                            branchList: nextBranchList
                        })
                        let sssLength = sameStartSourceEdges.length || 0;
                        if(sssLength > 0) {
                            let endChildBranchList = childBranchMap.get(sameStartSourceEdges[sssLength-1].target) || [];
                            if(endChildBranchList.length > 0) {
                                if(endChildBranchList[endChildBranchList.length-1].target === endTargetId){
                                    return fList;
                                }
                            }
                        }
                    }
                    fList.push(nodeMap.get(endTargetId)); // 改成新建一个递归方法 自递归实现第一层逐步增加branchList
                }
            }
            return fList;
        }
    }
    return flowList;
}

function findLastIndex(list, key, value) {
    for (let i = list.length - 1; i >= 0; i--) {
        if (list[i][key] === value) {
            return i;
        }
    }
    return -1;
}

const flowList = transInfo2FlowList(groupInfo);
console.log('flowList======>', flowList);

console.log('extractNodesAndEdges(flowList)-------->', extractNodesAndEdges(flowList))




