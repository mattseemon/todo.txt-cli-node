exports.strings = {
    usage: {
        todo: 'For details of todo.txt task format please visit https://github.com/todotxt/todo.txt',
        syntax: '{magenta todo} {green [options]} {yellow [action]} {cyan [arguments]}',
        options: [
            {
                option: 'AutoArchive',
                alias: 'a',
                scope: ['done'],
                prompt: '-a, --AutoArchive',
                description: `Enables auto archive. Overrides default auto archive settings.`
            },
            {
                option: 'Config',
                alias: 'c',
                scope: ['global'],
                prompt: '-c, --Config [path]',
                description: `Overrides default config with custom config file.`
            },
            {
                option: 'DateOnAdd',
                alias: 't',
                scope: ['add', 'addm'],
                prompt: '-t, --DateOnAdd',
                description: `Add current date as created date when addinge new tasks.`
            },
            {
                option: 'PriorityOnAdd',
                alias: 'P',
                scope: ['add', 'addm'],
                prompt: '-P, --PriorityOnAdd',
                description: `Add default priority when addinge new tasks.`
            },
            {
                option: 'Force',
                alias: 'f',
                scope: ['global'],
                prompt: '-f, --Force',
                description: `Override user confirmations.`
            },
            {
                option: 'Help',
                alias: 'h',
                scope: ['global'],
                prompt: '-h, --Help',
                description: `Displays this help information.`
            },
            {
                option: 'HideContexts',
                alias: '@',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-@, --HideContexts',
                description: `Hides contexts in list output. Default is to show contexts.`
            },
            {
                option: 'HidePriorities',
                alias: 'p',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-p, --HidePriorities',
                description: `Hides priorities in list output. Default is to show priorities.`
            },
            {
                option: 'HideProjects',
                alias: '+',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-+, --HideProjects',
                description: `Hides projects in list output. Default is to show projects.`
            },
            {
                option: 'IgnoreCase',
                alias: 'i',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-i, --IgnoreCase',
                description: `Ignores case-sensitivity when applying filters. Default is 'false'.`
            },
            {
                option: 'License',
                alias: 'l',
                scope: ['global'],
                prompt: '-l, --License',
                description: `Displays the license information for this application.`
            },
            {
                option: 'NoColors',
                alias: 'C',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-C, --NoColors',
                description: `List output will not show any colors. Default is to show colors.`
            },
            {
                option: 'PreserveLineNumbers',
                alias: 'n',
                scope: ['move', 'del', 'deduplicate'],
                prompt: '-n, --PreserveLineNumbers',
                description: `Preserve line numbers of tasks during addition or deletion.`
            },
            {
                option: 'ShowHeaders',
                alias: 'H',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-H, --ShowHeaders',
                description: `Displays task list headers. Default is hidden.`
            },
            {
                option: 'SortBy',
                alias: 's',
                scope: ['list', 'listall', 'listfile', 'listpri'],
                prompt: '-s, --SortBy [field]',
                description: `Sorts the list output by item, projects, contexts, priorities. Defaults sort is by Item.`,
                values: ['Item', 'Context', 'Project', 'Priority']
            },
            {
                option: 'Verbose',
                alias: 'V',
                scope: ['global'],
                prompt: '-V, --Verbose',
                description: `Displays verbose information.`
            },
            {
                option: 'Version',
                alias: 'v',
                scope: ['global'],
                prompt: '-v, --Version',
                description: `Shows version and other information about this application.`
            }
        ],
        actions: [
            {
                action: 'add',
                prompt: `add {cyan '<task>'}`,
                alias: 'a',
                showTodo: true,
                description: `Adds a new task to your todo.txt file.`,
                details: `Project and context notations can be mentioned and are optional.\nQuotes are optional.`,
                example: `add 'Task I need to do +project @context' - Adds 'Task I need to do +project @context' as a new item on a new line.`
            },
            {
                action: 'addm',
                prompt: `addm {cyan '<task...>'}`,
                showTodo: true,
                description: `Add multiple new tasks to your todo.txt file.`,
                details: `All tasks can be entered in a single line separated by '\\\\n'.\nProject and context notations are optional.\nQuotes are optional.`,
                example: `addm 'First Task +project @context\\nSecond Task +project @context' - Adds 'First Task' on a new line. Adds 'Second Task' on its own line.`
            },
            {
                action: 'addto',
                prompt: `addto {cyan <dest> '<task>'}`,
                showTodo: true,
                description: `Adds a new task to any file specified.`,
                details: `<dest> can be full path or just file name.\nIf only file name is provided, it should exist in the same folder as the todo.txt file.\n\nProject and context notations are optional.\nQuotes are optional.`,
                example: `addto newtodo.txt 'Task I neeed to do +project @context' - Adds 'Task I need to do +project @context' to newtodo.txt file.`
            },
            {
                action: 'append',
                prompt: `append {cyan <item#> '<text>'}`,
                alias: 'app',
                description: `Appends text to end of the task.`,
                details: `Quotes are optional.`,
                example: `append 2 'Text to append' - Adds 'Text to append' to the end of task on 2.`
            },
            {
                action: 'archive',
                prompt: `archive`,
                description: `Archive completed items in your todo.txt file.`,
                details: `Moves all tasks marked as completed from your todo.txt to done.txt.\nAlso removes any blank lines as well.`
            },
            {
                action: 'deduplicate',
                prompt: `deduplicate`,
                description: `Removes duplicate items from your todo.txt file.`,
                details: `Removes all duplicate items from your todo.txt file.\nIf PreserveLineNumber setting is true, only the task is cleared without removing the line.`
            },
            {
                action: 'del',
                prompt: `del {cyan <item#> ['<text>']}`,
                alias: 'rm',
                description: `Deletes whole task or specified text from task`,
                details: `Deletes the task or <text> from task, on ITEM# from your todo.txt file.\n<text>' is optional.\nIf PreserveLineNumber setting is true, only the task is cleared without removing the line.`,
                example: `rm 2 - Deletes task on line 2 from your todo.txt file\nrm 2 'testing' - Removes the text 'testing' from task on line 2 of your todo.txt file.`
            },
            {
                action: 'depri',
                prompt: `depri {cyan <item#>}`,
                alias: 'dp',
                description: `Deprioritizes task`,
                details: `Deprioritizes or removes the priority of task(s) for an item in your todo.txt file.\n<item#> can be a single item number '1' or a range '3-5' ^or a combination of both separated by spaces. E.g. 1 3-5 17 22 30-37.`
            },
            {
                action: 'done',
                prompt: `done {cyan <item#>}`,
                alias: 'do',
                description: `Marks task as completed.`,
                details: `Marks the task(s) on the provided <item#> as done in your todo.txt file.\n<item#> can be a single item number '1' or a range '3-5' or a combination of both separated by spaces. E.g. 1 3-5 17 22 30-37.`,
                example: `do 10 - marks task on line 10 as done in your todo.txt file.`
            },
            {
                action: 'list',
                prompt: `list {cyan [<term>...]}`,
                alias: 'ls',
                description: `Displays list of active tasks, sorted and filtered.`,
                details: `Displays all the tasks in your todo.txt file with item numbers, sorted by priority that matches search <term>(s). If no <term>(s) specified will display all tasks.\n\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'\n\nQuotes are optional.`
            },
            {
                action: 'listall',
                prompt: `listall {cyan ['<term>...']}`,
                alias: 'lsa',
                description: `Displays list of all tasks including completed, sorted and filtered.`,
                details: `Displays all the tasks in your todo.txt and done.txt files with item numbers, sorted by priority that matches search <term>(s). If no <term>(s) specified will display all tasks.\n\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'\n\nQuotes are optional.`
            },
            {
                action: 'listcon',
                prompt: `listcon {cyan ['<term>...']}`,
                alias: 'lsc',
                description: `Displays a list of contexts, filtered`,
                details: `Displays a unique list of all contexts in your todo.txt file for tasks that matches search <term>(s). If no <term>(s) specified will display contexts from all tasks.\n\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'\n\nQuotes are optional.`
            },
            {
                action: 'listfile',
                prompt: `listfile {cyan <src> ['<term>...']}`,
                alias: 'lf',
                description: `Displays tasks from a specified file, sorted and filtered.`,
                details: `Displays all the tasks in <src> file with item numbers, sorted by priority that matches search <term>(s). If no <term>(s) specified will display all tasks.\n\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'.\n\nQuotes are optional.`
            },
            {
                action: 'listpri',
                prompt: `listpri {cyan [<pri>] ['<term>...']}`,
                alias: 'lsp',
                description: `Displays prioritized tasks, sorted and filtered.`,
                details: `Displays all prioritized tasks in your todo.txt file with item numbers, sorted by priority that matches specified <pri> and search <term>(s). If no <pri> or <term>(s) specified, will display all prioritized tasks.\n\n* PRIORITIES should be in the form 'A' for single priorities  or 'A-C' for a    range (lowest to highest).\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'.\n\nQuotes are optional.`
            },
            {
                action: 'listproj',
                prompt: `listproj {cyan ['<term>...']}`,
                alias: 'lsprj',
                description: `Displays a list of projects, filtered`,
                details: `Displays a unique list of all projects in your todo.txt file for tasks that matches search <term>(s). If no <term>(s) specified will display projects from all tasks.\n\n* By default displays tasks that match all <term>(s) (logical AND) E.g: 'XX     YY' will display all tasks that contain 'XX' and 'YY'.\n* To display tasks that match any <term> (logical OR),  replace ' '(blank       space) with '!'(exclamation)  E.g: 'XX!YY' will display all tasks that        contain 'XX' or 'YY'\n* To hide tasks that contain <term>(s), prefix <term> with '-'(minus sign)      E.g: '-XX' will display all tasks that dont contain 'XX'.\n\nQuotes are optional.`
            },
            {
                action: 'move',
                prompt: `move {cyan <item#> <dest> [<src>]}`,
                alias: 'mv',
                description: `Moves task to file.`,
                details: `Moves an item from a source text file to a destination text file.\n<item#> can be only be a single item number like '1'. If no <src> specified, <src> defaults to your todo.txt.`
            },
            {
                action: 'prepend',
                prompt: `prepend {cyan <item#> '<text>'}`,
                alias: 'prep',
                description: `Adds text to the start of a task.`,
                details: `Adds '<text>' to the begining of the task on line <item#>. <item#> can be only be a single item number like '1'.\nQuotes are optional.`
            },
            {
                action: 'pri',
                prompt: `pri {cyan <item#> <pri>}`,
                alias: 'p',
                description: `Adds priority to task`,
                details: `<item#> can be only be a single item number like '1'. If item is already prioritized, it will replace current priority with new <pri>.<pri> must be a letter between 'A' and 'Z'.`
            },
            {
                action: 'replace',
                prompt: `replace {cyan <item#> '<task>'}`,
                showTodo: true,
                description: `Replace exisiting task with new task.`,
                details: `Replace task on <item#> with <task>.\n<item#> can be only be a single item number like '1'\nQuotes are optional.`,
                example: `replace 2 'Updated Todo' - replaces task on 2 with 'Updated Todo'`
            },
            {
                action: 'report',
                prompt: `report`,
                description: `Updates report file with task statistics.`
            }
        ]
    }
}