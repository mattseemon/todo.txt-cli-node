const fs = require('fs-extra');
const os = require('os');
const cliFormat = require('cli-format');
const columnify = require('columnify');
const log = require('./logger');
const helper = require('./helper');
const dateformat = require('dateformat');

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
                return (item.todo.match(rg) ? true : false);
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
        const filter = (item) => {
            let todo = item.todo;
            if(global.config.IgnoreCase) {
                todo = todo.toLowerCase();
            }
            return eval(filters.script)
        };
        filters = buildFilterString(params.search);
        filteredTodos = filteredTodos.filter(filter);
        if(params.includeCompletedTasks) {
            filteredDones = filteredDones.filter(filter);
        }
    }

    let results = filteredTodos;
    if(params.includeCompletedTasks) {
        results = results.concat(filteredDones);
    }

    switch(global.config.SortBy) {
        case 'Priority':
            results = regexSort(results, /\([A-Z]\)/);
            break;
        case 'Context':
            results = regexSort(results, /\@[^ ]+/g);
            break;
        case 'Project':
            results = regexSort(results, /\+[^ ]+/g);
            break;
    }

    if(results.length > 0) {
        console.log(cliFormat.wrap(columnify(results, {
            showHeaders: global.config.ShowHeaders,
            config: {
                id: {
                    align: 'right',
                    dataTransform: (data) => {
                        if(data == '') {
                            return log.chalkish`{gray ${pad('x', filteredTodos.length.toString().length, ' ')}}`;
                        }
                        return pad(data, filteredTodos.length.toString().length);
                    }
                },
            todo: {
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
    }
    let statusString = `${helper.getFilenameUpper(params.todoPath)}: ${filteredTodos.length} of ${todos.length} tasks`;
    if(params.includeCompletedTasks) {
        statusString += ` | ${helper.getFilenameUpper(params.donePath)}: ${filteredDones.length} of ${dones.length} tasks`;
        statusString += ` | TOTAL: ${filteredTodos.length + filteredDones.length} of ${todos.length + dones.length} tasks`;
    }
    if(params.priorities) {
        statusString += `\n{${global.config.Colors.Prioritized} Prioritized Tasks Only. Priorities listed ${params.priorities.toUpperCase()}.}`;
    }
    if(params.search.length > 0) {
        statusString += `\n{${global.config.Colors.Filtered} Filtered List: '${filters.label}'. ${(global.config.IgnoreCase ? '[Case ignored]' : '')}}`;
    }

    console.log(cliFormat.wrap(log.chalkish`${statusString}`, {
        width: 80
    }));
}

exports.showContexts = (params) => {
    if(!params.todoPath) {
        params.todoPath = global.config.TODO_FILE;
    }

    if(!fs.existsSync(params.todoPath)) {
        throw `Parameter Invalid: '{blue PATH}'\nFile '{blue ${params.todoPath}}' is either invalid or missing. Verify if file exists in the location provided.`
    }

    let todos = loadTodos(params.todoPath);
    if(params.search.length > 0) {
        let filters = buildFilterString(params.search);

        todos = todos.filter((item) => {
            let todo = item.todo;
            if(global.config.IgnoreCase) {
                todo = todo.toLowerCase();
            }
            return eval(filters.script)
        });
    }

    let regex = /\@[^ ]+/g;
    let ctx = '', contexts = [];

    todos.forEach(item => {
        do {
            ctx = regex.exec(item.todo);
            if(ctx) {
                contexts.push(ctx[0]);
            }
        } while(ctx);
    });

    contexts = contexts.filter((element, position) => (contexts.indexOf(element) == position)).sort();

    if(contexts.length > 0) {
        log.info(`Contexts found in todo file. {white.bold ${contexts.join(', ').trim()}}`);
    } else {
        log.info(`No contexts found in todo file.`);
    }
}

exports.showProjects = (params) => {
    if(!params.todoPath) {
        params.todoPath = global.config.TODO_FILE;
    }

    if(!fs.existsSync(params.todoPath)) {
        throw `Parameter Invalid: '{blue PATH}'\nFile '{blue ${params.todoPath}}' is either invalid or missing. Verify if file exists in the location provided.`
    }

    let todos = loadTodos(params.todoPath);
    if(params.search.length > 0) {
        let filters = buildFilterString(params.search);

        todos = todos.filter((item) => {
            let todo = item.todo;
            if(global.config.IgnoreCase) {
                todo = todo.toLowerCase();
            }
            return eval(filters.script)
        });
    }

    let regex = /\+[^ ]+/g;
    let prj = '', projects = [];

    todos.forEach(item => {
        do {
            prj = regex.exec(item.todo);
            if(prj) {
                projects.push(prj[0]);
            }
        } while(prj);
    });

    projects = projects.filter((element, position) => (projects.indexOf(element) == position)).sort();

    if(projects.length > 0) {
        log.info(`Projects found in todo file. {white.bold ${projects.join(', ').trim()}}`);
    } else {
        log.info(`No projects found in todo file.`);
    }
}

exports.add = (params) => {
    if(!fs.existsSync(params.todoPath)) {
        throw `Parameter Invalid: '{blue DESTINATION}'\nFile '{blue ${params.todoPath}}' is either invalid or missing. Verify if file exists in the location provided.`
    }

    params.item = params.item.replace(/^\([a-z]\){0,1}/, (priority) => priority.toUpperCase());

    if(params.item.length > 0 && global.config.DateOnAdd) {
        let currentDate = dateformat(new Date(), 'yyyy-mm-dd');
        if(params.item.match(/^\([A-Z]\)/)) {
            params.item = params.item.replace(/^\([A-Z]\)/, (priority) => `${priority} ${currentDate}`)
        } else {
            params.item = `${currentDate} ${params.item}`;
        }
    }

    if(global.config.PriorityOnAdd && !params.item.match(/^\([A-Z]\)/)) {
        params.item = `(${global.config.DefaultPriority}) ${params.item}`;
    }

    let lineCount = (fs.readFileSync(params.todoPath, 'utf-8')).split(os.EOL).length;

    fs.appendFileSync(params.todoPath, params.item, 'utf-8');
    fs.appendFileSync(params.todoPath, os.EOL, 'utf-8');

    log.info(`Item '{blue ${lineCount}}' added.`)
}

exports.addMultiple = (params) => {
    var items = params.items.split('\\n');
    items.forEach(item => {
        this.add({ todoPath: params.todoPath, item: item });
    });
    log.info(`Added {blue ${items.length}} items.`);
}

const loadTodos = (file) => {
    let todos = [];

    let lines = (fs.readFileSync(file, 'utf-8')).split(os.EOL);
    let count = 0;

    lines.forEach(line => {
        if(line.trim().length > 0) {
            todos.push({id: ++count, todo: line});
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
            
            conditionString = `${oper}(todo.includes('${(global.config.IgnoreCase ? value.toLowerCase() : value)}'))`;
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

function regexSort (list, pattern) {
    function presetIndex(input) {
        if (pattern.test(input.todo)) {
            return input.todo.match(pattern)[0].replace(/[\(\)\+\@]/g, '');
        }
        return 'ZZZZZ';
    }

    let indexes = list.map(c => ({
        input: c,
        index: presetIndex(c)
    }));

    //console.log(indexes);

    indexes.sort((a, b) => {
        return a.index > b.index
    });

    
    return indexes.map(c => c.input);
};