import {TableRow} from 'gherkin-ast';
import {PreCompiler} from 'gherking';

class TableFormatter implements PreCompiler {

    onTableRow(row: TableRow) {
        row.cells.forEach(cell => {
            cell.value = cell.value.replace(/\|/g, '\\|');
        })
    }
}

export default TableFormatter;
