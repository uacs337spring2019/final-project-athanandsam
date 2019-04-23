// ms.js, Athan Walker and Samantha Callicutt, CSC337, Spring 2019


"use strict";
 

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
	 **
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
         **
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
                let url = "https://heroku.com/deploy?template=https://github.com/uacs337spring2019/final-project-athanandsam:";
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
	 **
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
         **
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
         **
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
         **
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
         **
         **/
        function isMine(piece, m) {
		let mines = [];
        	let url = "https://heroku.com/deploy?template=https://github.com/uacs337spring2019/final-project-athanandsam:";
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
         **
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
         **
         **/
        function isOver() {
		alert("You won!");
		reveal();
	}

	/**
         **
         **/
        function marker() {
                mark = 1;
        }

	/**
         **
         **/
        function unmarker() {
                unmark = 1;
        }

	/**
         **
         **/
        function flag(piece) {
		piece.innerHTML = "?";
        }

	/**
	 **
	 **/
	function over() {
		this.style.border = "1px solid white";
		this.style.cursor = "pointer";
	}

	/**
         **
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
