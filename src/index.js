import insertTable from './commands/insertTable';
import insertBelow from './commands/insertBelow';
import insertRight from './commands/insertRight';
import removeTable from './commands/removeTable';
import removeColumn from './commands/removeColumn';
import removeRow from './commands/removeRow';
import mergeSelection from './commands/mergeSelection';
import splitCell from './commands/splitCell';
import checker from './commands/checker';

import withTable from './withTable';
const commands = {
    insertTable,
    insertBelow,
    insertRight,
    removeTable,
    removeColumn,
    removeRow,
    mergeSelection,
    splitCell,
    checker,
}
export { commands, withTable }