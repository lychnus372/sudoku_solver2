let _board;

const initializer = ()=>{
    const board = document.getElementById("board");
    const form = document.createElement("form");
    const table = document.createElement("table");
    form.name = "box";
    form.appendChild(table);
    board.appendChild(form);

    // セルの生成
    for(let i=0;i<9;i++){
        const tr = document.createElement("tr");
        for(let j=0;j<9;j++){
            const cell = document.createElement("input");
            const th = document.createElement("th");
            cell.type = "text";
            
            if((~~(i/3)+~~(j/3))%2===1){
                cell.className = "noncolored_cell cell";
            }else{
                cell.className = "colored_cell cell";
            }
            cell.id = "cell" + (i*9+j);
            th.appendChild(cell);
            tr.appendChild(th);
        }
        table.appendChild(tr);
    }


    // 矢印キーが押されたときの挙動
    document.addEventListener("keydown", (event)=>{
        const key = event.keyCode;
        const element = document.activeElement;
        if(element.type!=="text"){
            return;
        }
        const cellid = parseInt(element.id.substr(4), 10);
        let newid;

        switch(key){
        case 38://上
            if(cellid<9){
                newid = cellid + 72;
            }else{
                newid = cellid - 9;
            }
            document.getElementById("cell" + newid).focus();
            break;
        case 40://下
            if(cellid>72){
                newid = cellid - 72;
            }else{
                newid = cellid + 9;
            }
            document.getElementById("cell" + newid).focus();
            break;
        case 37://左
            if(cellid%9===0){
                newid = cellid + 8;
            }else{
                newid = cellid - 1;
            }
            document.getElementById("cell" + newid).focus();
            break;
        case 39://右
            if(cellid%9===8){
                newid = cellid - 8;
            }else{
                newid = cellid + 1;
            }
            document.getElementById("cell" + newid).focus();
            break;
        case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
            element.value = key - 48;
            break;
        case 8: case 46:
            element.value = "";
            break;
        default:
            break;
        }

        event.preventDefault();
        
    });


    // _boardを初期化
    _board = new Sudoku(test);
    _board.showResult();
};

window.onload = initializer;

// solved button
const click1 = ()=>{
    if(_board.solved===true){
        return;
    }
    _board = new Sudoku();
    _board.setBoard();

    const solved_board = solve(_board);

    if(solved_board.isContradicts()){
        console.log("解けない数独です");
    }

    const textboxes = document.getElementsByClassName("cell");
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            textboxes[i*9+j].value = "";
            textboxes[i*9+j].style.color = "#000000";
            if(solved_board.cells[i][j]>0){
                textboxes[i*9+j].value = solved_board.cells[i][j];
                if(_board.cells[i][j]===0){
                    textboxes[i*9+j].style.color = "#0000ff";
                }
            }
        }
    }
    _board.solved = true;

};

// back button
const click2 = ()=>{
    if(_board.solved===true){
        _board.showResult();
        _board.solved = false;
        const textboxes = document.getElementsByClassName("cell");
        for(const cell of textboxes){
            cell.style.color = "#000000";
        }
        return;
    }
};

// clear button
const click3 = ()=>{
    
    _board = new Sudoku();
    _board.showResult();
    const textboxes = document.getElementsByClassName("cell");
    for(const cell of textboxes){
        cell.style.color = "#000000";
    }
    return;
};

const solve = (board)=>{
    let parent = new Sudoku(board);

    do{
        parent = parent.deleteMethod();
    }while(parent.modified);

    if(parent.isContradicts() || parent.isSolved()){
        return parent;
    }

    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(parent.cells[i][j]===0){
                for(let n=0;n<9;n++){
                    if(parent.prob[i][j][n]===1){
                        let child = new Sudoku(parent);
                        child.cells[i][j] = n + 1;
                        child.eliminatePossibiliy();
                        child = solve(child);
                        if(child.isContradicts()){
                            parent.prob[i][j][n] = 0;
                        }
                        if(child.isSolved()){
                            return child;
                        }
                    }
                }
            }
        }
    }


    return parent;

};

class Sudoku {
    constructor(arg){
        this.cells = new Array(9);
        this.prob = new Array(9);
        this.modified = false;

        for(let i=0;i<9;i++){
            this.cells[i] = new Array(9);
            this.cells[i].fill(0);
        }

        for(let i=0;i<9;i++){
            this.prob[i] = new Array(9);
            for(let j=0;j<9;j++){
                this.prob[i][j] = new Array(9);
                this.prob[i][j].fill(1);
            }
        }

        if(arg instanceof Sudoku){
            for(let i=0;i<9;i++){
                for(let j=0;j<9;j++){
                    this.cells[i][j] = arg.cells[i][j];
                }
            }

            
            for(let i=0;i<9;i++){
                for(let j=0;j<9;j++){
                    for(let k=0;k<9;k++){
                        this.prob[i][j][k] = arg.prob[i][j][k];
                    }
                }
            }
        }

    }

    setBoard(){
        const cells = this.cells

        // 初期化
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                this.cells[i][j] = 0;
                for(let k=0;k<9;k++){
                    this.prob[i][j][k] = 1;
                }
            }
        }

        const textboxes = document.getElementsByClassName("cell");
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                const value = textboxes[i*9+j].value;
                const num = parseInt(value, 10);
    
                switch(num){
                    case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:
                        cells[i][j] = num;
                        break;
                    default:
                        cells[i][j] = 0;
                        break;
                }
            }
        }

        this.eliminatePossibiliy();
    };
    
    deleteMethod(){
        const sudoku = new Sudoku(this);
        const prob = sudoku.prob;
        const cells = sudoku.cells;
        
        for(let x=0;x<9;x++){
            for(let y=0;y<9;y++){
                // 消去法 マス
                if(cells[x][y]===0){
                    let count = 0, num = 0;
                    for(let i=0;i<9;i++){
                        if(prob[x][y][i]===1){
                            count++;
                            num = i;
                        }
                    }

                    if(count===1){
                        cells[x][y] = num + 1;
                        sudoku.modified = true;
                        sudoku.eliminatePossibiliy();
                    }
                }
            }
        }

        // 消去法 行
        for(let x=0;x<9;x++){
            for(let n=0;n<9;n++){
                let count = 0, col;
                for(let y=0;y<9;y++){
                    if(prob[x][y][n]===1){
                        count++;
                        col = y;
                    }
                }

                if(count===1 && cells[x][col]===0){
                    cells[x][col] = n + 1;
                    sudoku.modified = true;
                    sudoku.eliminatePossibiliy();
                }
            }
        }

        // 消去法 列
        for(let y=0;y<9;y++){
            for(let n=0;n<9;n++){
                let count = 0, row;
                for(let x=0;x<9;x++){
                    if(prob[x][y][n]===1){
                        count++;
                        row = x;
                    }
                }

                if(count===1 && cells[row][y]===0){
                    cells[row][y] = n + 1;
                    sudoku.modified = true;
                    sudoku.eliminatePossibiliy();
                }
            }
        }

        // 消去法 ブロック
        for(let I=0;I<9;I+=3){
            for(let J=0;J<9;J+=3){
                for(let n=0;n<9;n++){
                    let count = 0, x, y;
                    for(let i=0;i<3;i++){
                        for(let j=0;j<3;j++){
                            if(prob[I+i][J+j][n]===1){
                                count++;
                                x = i;
                                y = j;
                            }
                        }
                    }

                    if(count===1 && cells[I+x][J+y]===0){
                        cells[I+x][J+y] = n + 1;
                        sudoku.modified = true;
                        sudoku.eliminatePossibiliy();
                    }
                }
            }
        }
        

        return sudoku;
    }

    eliminatePossibiliy(){
        
        const prob = this.prob;
        const cells = this.cells;
        

        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                if(cells[i][j]!==0){
                    const n = cells[i][j] - 1;
                    const [I, J] = this.getBlockPosition(i, j);
                    for(let k=0;k<9;k++){
                        prob[i][j][k] = 0;
                        prob[i][k][n] = 0;
                        prob[k][j][n] = 0;
                    }
                    prob[I+0][J+0][n] = 0;
                    prob[I+0][J+1][n] = 0;
                    prob[I+0][J+2][n] = 0;
                    prob[I+1][J+0][n] = 0;
                    prob[I+1][J+1][n] = 0;
                    prob[I+1][J+2][n] = 0;
                    prob[I+2][J+0][n] = 0;
                    prob[I+2][J+1][n] = 0;
                    prob[I+2][J+2][n] = 0;
                    
                    prob[i][j][n] = 1;
                }
            }
        }
    }

    isContradicts(){
        const cells = this.cells;
        const prob = this.prob;
        
        //マス
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(cells[x][y]===0){
                    let count = 0;
					for(let i=0;i<9;i++){
						count += prob[x][y][i];
					}
					if(count===0){
						//console.log("矛盾(ﾏｽ) cell(" + x + "," + y + ") に数値が入らない");
						return true;
					}
				}
			}
        }
        
        //縦列
        for(let n=0;n<9;n++){
            for(let y=0;y<9;y++){
                let count = 0;
                for(let x=0;x<9;x++){
                    count += prob[x][y][n];
                }
                if(count===0){
                    return true;
                }
            }
        }

        //横列
        for(let n=0;n<9;n++){
            for(let x=0;x<9;x++){
                let count = 0;
                for(let y=0;y<9;y++){
                    count += prob[x][y][n];
                }
                if(count===0){
                    return true;
                }
            }
        }

        // ブロック
        for(let I=0;I<9;I+=3){
            for(let J=9;J<9;J++){
                let count = 0;
                count += prob[I+0][J+0][n];
                count += prob[I+0][J+1][n];
                count += prob[I+0][J+2][n];
                count += prob[I+1][J+0][n];
                count += prob[I+1][J+1][n];
                count += prob[I+1][J+2][n];
                count += prob[I+2][J+0][n];
                count += prob[I+2][J+1][n];
                count += prob[I+2][J+2][n];
                if(count===0){
                    return true;
                }
            }
        }

        return false;
    }

    isSolved(){
        const cells = this.cells;
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                if(cells[i][j]===0){
                    return false;
                }
            }
        }
        return true;
    }

    getBlockPosition(x, y){
        let X, Y;
        switch(x){
            case 0:case 1:case 2:
                X = 0;
                break;
            case 3:case 4:case 5:
                X = 3;
                break;
            case 6:case 7:case 8:
                X = 6;
                break;
            }
        switch(y){
            case 0:case 1:case 2:
                Y = 0;
                break;
            case 3:case 4:case 5:
                Y = 3;
                break;
            case 6:case 7:case 8:
                Y = 6;
                break;
            }
        
        return [X, Y];
    
    }

    showResult(){
        const textboxes = document.getElementsByClassName("cell");
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                textboxes[i*9+j].value = "";
                if(this.cells[i][j]>0){
                    textboxes[i*9+j].value = this.cells[i][j];
                }
            }
        }
    }
}

const test = new Sudoku();
test.cells = [
[0, 9, 0, 3, 1, 0, 0, 0, 0],
[4, 0, 0, 0, 0, 0, 0, 8, 6],
[0, 0, 0, 0, 0, 0, 0, 0, 7],
[0, 2, 0, 0, 0, 0, 1, 0, 0],
[0, 0, 0, 0, 0, 8, 0, 0, 0],
[0, 0, 0, 6, 0, 0, 0, 0, 0],
[6, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 9, 0, 2, 0, 0],
[7, 5, 0, 0, 2, 0, 0, 0, 0]
]