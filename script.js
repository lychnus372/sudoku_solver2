let _board;
let active_cell = -1;
let textcells;

const initializer = ()=>{
    const board = document.getElementById("board");
    const form = document.createElement("form");
    const table = document.createElement("table");
    form.name = "box";
    form.appendChild(table);
    board.appendChild(form);

    const textboxes = new Array();
    textcells = textboxes;

    // セルの生成
    for(let i=0;i<9;i++){
        const tr = document.createElement("tr");
        for(let j=0;j<9;j++){
            const cell = document.createElement("div");
            const th = document.createElement("th");
            
            //セルクリックされたら、idをメモしておく
            cell.addEventListener("click", ()=>{
                cell.style.borderColor = "#8080f0";
                active_cell = i*9 + j;
            });
            
            if((~~(i/3)+~~(j/3))%2===0){
                cell.style.background = "#e0e0e0";
            }
            cell.className = "cell";
            cell.id = "cell" + (i*9+j);
            th.appendChild(cell);
            tr.appendChild(th);
            textboxes.push(cell);
        }
        table.appendChild(tr);
    }
    // セル以外がクリックされたら
    document.addEventListener("click", (event)=>{
        const path0 = event.path[0];
        if(path0.className!=="cell"){
            if(active_cell!==-1){
                textboxes[active_cell].style.borderColor = "#c0c0c0";
            }
            
            active_cell = -1;
        }
    });


    // 矢印キーが押されたときの挙動
    document.addEventListener("keydown", (event)=>{
        const key = event.keyCode;
        if(active_cell===-1){
            return;
        }
        
        switch(key){
        case 38://上
            textboxes[active_cell].style.borderColor = "#c0c0c0";
            if(active_cell<9){
                active_cell += 72;
            }else{
                active_cell += - 9;
            }
            textboxes[active_cell].style.borderColor = "#8080f0";
            event.preventDefault();
            break;
        case 40://下
            textboxes[active_cell].style.borderColor = "#c0c0c0";
            if(active_cell>72){
                active_cell += -72;
            }else{
                active_cell += 9;
            }
            textboxes[active_cell].style.borderColor = "#8080f0";
            event.preventDefault();
            break;
        case 37://左
            textboxes[active_cell].style.borderColor = "#c0c0c0";
            if(active_cell%9===0){
                active_cell += 8;
            }else{
                active_cell += -1;
            }
            textboxes[active_cell].style.borderColor = "#8080f0";
            event.preventDefault();
            break;
        case 39://右
            textboxes[active_cell].style.borderColor = "#c0c0c0";
            if(active_cell%9===8){
                active_cell += -8;
            }else{
                active_cell += 1;
            }
            textboxes[active_cell].style.borderColor = "#8080f0";
            event.preventDefault();
            break;
        case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
            textboxes[active_cell].innerText = key-48;
            event.preventDefault();
            break;
        case 8: case 46:
        textboxes[active_cell].innerText = "";
            event.preventDefault();
            break;
        default:
            break;
        }
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

    const textboxes = textcells;
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            textboxes[i*9+j].innerText = "";
            textboxes[i*9+j].style.color = "#000000";
            if(solved_board.cells[i][j]>0){
                textboxes[i*9+j].innerText = solved_board.cells[i][j];
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
        const textboxes = textcells;
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
    _board.solved = false;
    const textboxes = textcells;
    for(const cell of textboxes){
        cell.style.color = "#000000";
    }
    return;
};

let count = 0;
const solve = (board)=>{
    count++;
    let parent = new Sudoku(board);

    do{
        parent = parent.deleteMethod();
    }while(parent.modified);

    if(parent.isContradicts() || parent.isSolved()){
        return parent;
    }
    
    do{
        let child = new Sudoku(parent);
        const [x, y, n] = child.getEasyCell();
        if(n===-1){
            return parent;
        }
        child.cells[x][y] = n+1;
        child = solve(child);
        if(child.isContradicts()){
            parent.prob[x][y][n] = 0;
        }
        if(child.isSolved()){
            return child;
        }
    }while(true);
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

        const textboxes = textcells;
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                const value = textboxes[i*9+j].innerText;
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
        sudoku.eliminatePossibiliy();
        
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

    getEasyCell(){
        const cells = this.cells;
        const prob = this.prob;
        let cell_x,  cell_y, cell_n=-1, min = 10;

        for(let x=0;x<9;x++){
            for(let y=0;y<9;y++){
                if(cells[x][y]===0){
                    let num_prob = 0;
                    let temp_n;
                    for(let n=8;n>-1;n--){
                        if(prob[x][y][n]===1){
                            num_prob++;
                            temp_n = n;
                        }
                    }
                    if(num_prob===2){
                        return [x, y, temp_n];
                    }
                    if(num_prob<min && num_prob>1){
                        cell_x = x;
                        cell_y = y;
                        cell_n = temp_n;
                        min = num_prob;
                    }
                }
            }
        }

        return [cell_x, cell_y, cell_n];
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
        const textboxes = textcells;
        for(let i=0;i<9;i++){
            for(let j=0;j<9;j++){
                textboxes[i*9+j].innerText = "";
                if(this.cells[i][j]>0){
                    textboxes[i*9+j].innerText = this.cells[i][j];
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