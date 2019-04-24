"use strict";
  
/*
 * Author: Athan Walker, Sam Callicutt
 * File: ms.js
 * Purpose: To provide the events consequent to ms.html
 * CSC 337
 * Spring 2019
 */

(function() {
	let mark = 0;
	let unmark = 0;
	let uncovered = 0;
	let totMines = 0;

	window.onload = function() {
		let markButton = document.getElementById("mark");
		let unmarkButton = document.getElementById("unmark");
		let newGameButton = document.getElementById("newGame");

		markButton.onclick = marker;
		unmarkButton.onclick = unmarker;
		newGameButton.onclick = generate;


		generate();
	};

	/**
	 ** generate
	 ** Purpose: To generate game board
	 **/
	function generate() {
		let grid = document.getElementById("board");
		while (grid.firstChild) {
			grid.removeChild(grid.firstChild);
		}
		
		let numMines = 40;
	
		// Clears the content of ms.txt	
		storeMine(-1);

		// Makes the game pieces and adds them to the board
                for(let i = 0; i < 256; i++) {
                        let piece = document.createElement("div");
                        piece.className = "piece";
                        piece.onmouseover = over;
                        piece.onmouseout = out;

			piece.onclick = checkPosition;
			
			// Randomly generates a mine
			if(numMines > 0) {
				let num = Math.floor((Math.random() * 7) + 1);
				if(num == 1) {
					piece.className = "mine";
					storeMine(i);
					numMines -= 1;
				}
			}
			grid.appendChild(piece);
		}
		totMines = 40 - numMines;
		console.log(40 - numMines); //////////
	}

	/**
         ** storeMine
	 ** Purpose: To store a mine in a given tile index
         **/
        function storeMine(i) {
		const send = {index: i};
                const fetchOptions = {
                        method : 'POST',
                        headers : {
                                'Accept': 'application/json',
                                'Content-Type' : 'application/json'
                        },
                        body : JSON.stringify(send)
                };
                let url = "https://minesweeper-v1.herokuapp.com:";
                fetch(url, fetchOptions)
                        .then(checkStatus)
                        .then(function(responseText) {
                                console.log(responseText);
                        })
                        .catch(function(error) {
                                console.log(error);
                        });
	}

	/**
	 ** chackPosition
	 ** Purpose: When tile is clicked this function identifies its mine neighbor number
	 **          or that it is a mine
         **/
        function checkPosition() {
		if(mark == 1) {
			flag(this);
			mark = 0;
			return;
		}

		// Does nothing if this piece is flagged
		if(this.innerHTML == "?") {
			// Unmarks the marked piece if the button "unmark" was selected
			if(unmark == 1) {
				this.innerHTML = "";
				unmark = 0;
			}
                        return;
                }

		let board = document.getElementById("board").children;
		let i = 0;
		for(i = 0; i < 256; i++) {
			let piece = board[i];
			if(piece == this) {
				isMine(piece, i);
				this.style.backgroundColor = "#d9d9d9";
				break;
			}
		}

		let numMines = 0;

		// Checks the top of the piece for mines
		if(i > 15) {
			numMines = checkUp(board, numMines, i);
		}

		// Checks the bottom of the piece for mines
		if(i < 240) {
			numMines = checkBottom(board, numMines, i);
		}

		// Checks right of the piece for mines
		if((i + 1) % 16 != 0) {
			let other = board[i + 1];
			if(other.className == "mine") {
				numMines += 1;
			}
		}

		// Checks left of the piece for mines
		if(i % 16 != 0 && i != 0) {
      	        	let other = board[i - 1];
           		if(other.className == "mine") {
                 	       numMines += 1;
                        }
                }

		if(numMines != 0 && this.className != "mine") {
			this.innerHTML = numMines.toString();
			numColor(this);
		}
		this.onmouseover = null;
		this.onclick = null;
		uncovered += 1;

		if(uncovered == (256 - totMines)) {
			isOver();
		}
	}

	/**
         ** checkUp
	 ** Purpose: Checks the top left, middle and right tile for mines
	 ** 	     then adds that number to a count
	 **
	 ** Returns:
	 ** num - The number of mines
         **/
        function checkUp(board, num, i) {
		// Checks top right
		if((i + 1) % 16 != 0) {
			let other = board[i - 15];
			if(other.className == "mine") {
				num += 1;
			}
		}
		// Checks top left
		if(i % 16 != 0) {
			let other = board[i - 17];
			if(other.className == "mine") {
				num += 1;
			}
		}
		// Checks top middle
		let other = board[i - 16];
		if(other.className == "mine") {
			num += 1;
		}
		return num;
	}

	/**
         ** checkBottom
         ** Purpose: Checks the bottom left, middle and right tile for mines
         **          then adds that number to a count
         **
         ** Returns:
         ** num - The number of mines
         **/
        function checkBottom(board, num, i) {
		// Checks bottom right
                if((i + 1) % 16 != 0) {
                        let other = board[i + 17];
                        if(other.className == "mine") {
                                num += 1;
                        }
                }
                // Checks bottom left
                if(i % 16 != 0) {
                        let other = board[i + 15];
                        if(other.className == "mine") {
                                num += 1;
                        }
                }
                // Checks bottom middle
                let other = board[i + 16];
                if(other.className == "mine") {
                        num += 1;
                }
                return num;
	}

	/**
         ** reveal
	 ** Purpose: To expose the tile as a mine
         **/
        function reveal() {
                let board = document.getElementById("board").children;
                for(let i = 0; i < 256; i++) {
                        let piece = board[i];
                        if(piece.className == "mine") {
                                piece.style.backgroundColor = "red";
                        }
			piece.onclick = null;
			piece.onmouseover = null;
                }
        }

	/**
         ** isMine
	 ** Purpose: Checks a file containing the location of the mines to see if
	 ** 	     the last selected tile is a mine
         **/
        function isMine(piece, m) {
        	let url = "https://minesweeper-v1.herokuapp.com:";
                fetch(url)
                        .then(checkStatus)
                        .then(function(responseText) {
                                let data = JSON.parse(responseText);
                                if(data.mines.length <= 1) {
                                        return;
                                }

                                // Reads through mine indicies
                                for(let i = 0; i < data.mines.length - 1; i++) {
                                       	if(m == data.mines[i]) {
						piece.style.backgroundColor = "red";
						piece.innerHTML = "";
                                        	alert("You hit a mine!\nGame Over");
                                        	reveal(1);
					}
                                }
                        })
                        .catch(function(error) {
                                console.log(error);
                        });
        }
	
	/**
         ** numColor
	 ** Purpose: Takes a number of a tile and gives it a color
         **/
        function numColor(piece) {
		if(piece.innerHTML == "1") {
			piece.style.color = "#5c00e6";
		}
		else if(piece.innerHTML == "2") {
                        piece.style.color = "#c61aff";
                }
		else if(piece.innerHTML == "3") {
                        piece.style.color = " #e600e6";
                }
		else if(piece.innerHTML == "4") {
                        piece.style.color = "#e6005c";
                }
		else if(piece.innerHTML == "5") {
                        piece.style.color = "#ff6600";
                }
		else if(piece.innerHTML == "6") {
                        piece.style.color = "#ff3300";
                }
		else if(piece.innerHTML == "7") {
                        piece.style.color = "#ff0000";
                }
		else if(piece.innerHTML == "8") {
                        piece.style.color = "#990000";
                }
        }

	/**
         ** isOver
	 ** Purpose: Sends an alert message if the game is won
         **/
        function isOver() {
		alert("You won!");
		reveal();
	}

	/**
         ** marker
	 ** Purpose: To set the mark flag
         **/
        function marker() {
                mark = 1;
		unmark = 0;
        }

	/**
         ** unmarker
	 ** Purpose: To set the unmark flag
         **/
        function unmarker() {
                unmark = 1;
		mark = 0;
        }

	/**
         ** flag
	 ** Purpose: To mark a tile with a questionmark so that when clicked
	 ** 	     again the tile will not go off if it is a mine
         **/
        function flag(piece) {
		piece.innerHTML = "?";
        }

	/**
	 ** over
	 ** Purpose: Highlights the tile which the mouse is over white
	 **/
	function over() {
		this.style.border = "1px solid white";
		this.style.cursor = "pointer";
	}

	/**
         ** out
	 ** Purpose: Males the border of the tile black
         **/
        function out() {
                this.style.border = "1px solid black";
		this.style.cursor = "default";
        }

	/**
         ** checkStatus
         ** Purpose: To check the response status of the web service request
         **
         ** Arguments:
         ** response - The response to the web server request
         **
         ** Returns: None
         **/
        function checkStatus(response) {
                if (response.status >= 200 && response.status < 300) {
                        return response.text();
                }
                else {
                        return Promise.reject(new Error(response.status + ":" +
                        response.statusText));
                }
        }
})();
