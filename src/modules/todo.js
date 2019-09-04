const fs = require('fs-extra');
const os = require('os');
const cliFormat = require('cli-format');
const columnify = require('columnify');
const log = require('./logger');
const helper = require('./helper');

exports.showTodos = (params) => {
    if(!params.todoPath) {
        params.todoPath = global.config.TODO_FILE;
    }
    if(!params.donePath) {
        params.donePath = global.config.DONE_FILE;
    }
    if(!params.includeCompletedTasks) {
        params.includeCompletedTasks = false;
    }

    let todos = loadTodos(params.todoPath);
    let filteredTodos = todos;

    let dones = [];
    let filteredDones = [];

    if(params.priorities) {
        try {
            let rg = new RegExp(`^^\\([${params.priorities}]\\)`);

            filteredTodos = filteredTodos.filter((item) => {
                return (item.task.match(rg) ? true : false);
            });
        }
        catch(err) { 
            throw `Parameter Invalid: 'PRIORITIES' ${params.priorties} is not a valid search pattern for PRIORITIES. PRIORITIES should be in the form 'A' for single priorities or 'A-C' for a range (lowest to highest).`;
        }
    }

    if(params.includeCompletedTasks) {
        dones = loadTodos(params.donePath);
        dones.forEach(item => {
            item.id = '';
        });
        filteredDones = dones;
    }

    let filters;
    if(params.search.length > 0) {
        filters = buildFilterString(params.search);
        filteredTodos = filteredTodos.filter(item => eval(filters.script));
        if(params.includeCompletedTasks) {
            filteredDones = filteredDones.filter(item => eval(filters.script));
        }
    }

    let results = filteredTodos;
    if(params.includeCompletedTasks) {
        results = results.concat(filteredDones);
    }

    console.log(cliFormat.wrap(columnify(results, {
        showHeaders: global.config.ShowHeaders,
        config: {
            id: {
                align: 'right',
                dataTransform: (data) => {
                    if(data == '') {
                        return log.chalkish`{gray ${pad('x', filteredTodos.length.toString().length)}}`;
                    }
                    return pad(data, filteredTodos.length.toString().length);
                }
            },
            task: {
                dataTransform: (data) => {
                    let matches = data.trim().match(/\([A-Z]\)/);
                    let color = '';
                    if(matches) {
                        switch(matches[0]) {
                            case '(A)':
                                color = global.config.Colors.PriorityA;
                                break;
                            case '(B)':
                                color = global.config.Colors.PriorityB;
                                break;
                            case '(C)':
                                color = global.config.Colors.PriorityC;
                                break;
                            default:
                                color = global.config.Colors.PriorityX;
                                break;
                        }
                        return log.chalkish`{${color} ${data}}`;
                    } else {
                        if(data.startsWith('x ')) {
                            return log.chalkish`{${global.config.Colors.Completed} ${data.replace('x ', '')}}`;
                        }
                        return log.chalkish`{${global.config.Colors.PriorityNone} ${data}}`;
                    }
                }
            }
        }
    }), {
        paddingLeft: '  '
    }));

    console.log('');
    let statusString = `${helper.getFilenameUpper(params.todoPath)}: ${filteredTodos.length} of ${todos.length} tasks`;
    if(params.includeCompletedTasks) {
        statusString += ` | ${helper.getFilenameUpper(params.donePath)}: ${filteredDones.length} of ${dones.length} tasks`;
        statusString += ` | TOTAL: ${filteredTodos.length + filteredDones.length} of ${todos.length + dones.length} tasks`;
    }
    if(params.priorities) {
        statusString += `\n{${global.config.Colors.Prioritized} Prioritized Tasks Only. Priorities listed ${params.priorities.toUpperCase()}.}`;
    }
    if(params.search.length > 0) {
        statusString += `\n{${global.config.Colors.Filtered} Filtered List: '${filters.label}'.}`
    }

    console.log(cliFormat.wrap(log.chalkish`${statusString}`, {
        width: 80
    }));
}


const loadTodos = (file) => {
    let todos = [];

    let lines = (fs.readFileSync(file, 'utf-8')).split(os.EOL);
    let count = 0;

    lines.forEach(line => {
        if(line.trim().length > 0) {
            todos.push({id: ++count, task: line});
        }
    });

    return todos;
}

const buildFilterString = (params, operator = '&&') => {
    params = params.join(' ').replace(' ~', '~').split(' ');

    let filterString = '';
    let filterLabel = '';

    let index = 0;
    params.forEach(param => {
        let temp = param.split('~');
        let conditionString = '';

        let condition = '';
        let conditionLabel = '';

        if(temp.length > 1) {
            condition = buildFilterString(temp, '||');

            conditionString = `(${condition.script})`;
            conditionLabel = condition.label.replace('LIKE ', '');
        } else {
            let oper = (temp[0].startsWith('!') ? '!' : '');
            let value = (temp[0].startsWith('!') ? temp[0].substring(1) : temp[0]);
            
            conditionString = `${oper}(item.task.includes('${value}'))`;
            conditionLabel = `${(oper == '!' ? 'NOT ' : '')}*${value}*`;
        }

        if(index == 0) {
            filterString = conditionString;
            filterLabel = `LIKE ${conditionLabel}`;
        } else {
            filterString += ` ${operator} ${conditionString}`;
            filterLabel += ` ${(operator == '&&' ? 'AND' : 'OR')} ${conditionLabel}`;
        }
        index++;
    });

    return { script: filterString, label: filterLabel };
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}