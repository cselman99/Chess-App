import { SIZE} from './Notation'

const mapPieces = {
    'white-pawn': 'P',
    'white-rook': 'R',
    'white-bishop': 'B',
    'white-knight': 'N',
    'white-king': 'K',
    'white-queen': 'Q',
    'black-pawn': 'p',
    'black-rook': 'r',
    'black-bishop': 'b',
    'black-knight': 'n',
    'black-king': 'k',
    'black-queen': 'q',
}

export function rotateCCW(matrix) {
    const n = matrix.length;
    const x = Math.floor(n/ 2);
    const y = n - 1;
    var k;
    for (let i = 0; i < x; i++) {
       for (let j = i; j < y - i; j++) {
            k = matrix[i][j];
            matrix[i][j] = matrix[j][y - i];  // 0,2  1,2
            matrix[j][y - i] = matrix[y - i][y - j]; // 2,2  2,1
            matrix[y - i][y - j] = matrix[y - j][i]  // 2,0  1,0
            matrix[y - j][i] = k
       }
    }
}


export function buildMat(pieces) {
    var board = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']];
    
      var x;
      var y;
      var pieceName;
      var pieceLoc; 
    
    if (pieces == undefined) {
        console.log("Could not detect pieces. Returning to home page.");
    } else {
        for (var i = 0; i < pieces.length; i++) {
            pieceName = pieces[i][0];
            pieceLoc = pieces[i][1];
            x = pieceLoc[0];
            y = pieceLoc[1];
            // console.log(`${x}, ${y} - ${pieceName}}`);
            board[y - 1][x - 1] = mapPieces[pieceName];
        }
    }
    rotateCCW(board);
    return board // Rotate perspective 90 deg CCW
}

export function matToFen(board, turn='w', enpassant='-', blackCastle='-', whiteCastle='-') {
    var castle = "";
    if (blackCastle !== '-' && whiteCastle !== '-') {
        castle = whiteCastle + blackCastle;
    } else if (blackCastle !== '-' && whiteCastle === '-') {
        castle = blackCastle;
    } else if (blackCastle === '-' && whiteCastle !== '-') {
        castle = whiteCastle;
    } else {
        castle = "-";
    }
    if (board == undefined) {
        console.log('Matrix is undefined. Cannot convert to fen');
        return '';
    }
    var counter;
    var fen_notation = '';
    for (var i = 0; i < board.length; i++) {
        counter = 0;
        for (var j = 0; j < board.length; j++) {
            if (board[i][j] === '') {
                counter += 1;
            } else {
                if (counter > 0) {
                    fen_notation += '' + counter;
                }
                counter = 0;
                fen_notation += board[i][j];
            }
        }
        if (counter > 0) {
            fen_notation += '' + counter;
        }
        fen_notation += '/';
    }

    fen_notation = fen_notation.substring(0, fen_notation.length - 1);
    fen_notation += ' ' + turn + ' ' + castle + ' ' + enpassant + ' 0 10';
    console.log(fen_notation);
    return fen_notation;
}


export function matTranslate({x, y}) {
    'worklet';
    var xs = Math.round(x / SIZE);
    var ys = Math.round(y / SIZE);
    
    return {x: xs, y: ys};
}