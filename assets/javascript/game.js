

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDz_w2zj5zmMnFbemSrRfuhoLuvW_eTWbs",
    authDomain: "codepractice-60987.firebaseapp.com",
    databaseURL: "https://codepractice-60987.firebaseio.com",
    projectId: "codepractice-60987",
    storageBucket: "codepractice-60987.appspot.com",
    messagingSenderId: "880959834398"
  };
  firebase.initializeApp(config);
  
  var turn = 1;
  let database = firebase.database();
  let connections = database.ref("/connections");
  let connectedStatus = database.ref(".info/connected");
  let numOfConnections = 0;
  let thisPlayerName = "";
  let opponentChoice = "";
  let OpponentWins = 0;
  let Wins = 0;
  let OpponentLosses = 0;
  let Losses = 0;
  let ties = 0;
  let opponentName = "";
  let playerturn = 0;
  let opponent = 0;
  let guessNumber = 0;
  let results = "";
  let currentChoice = "";
  let wins = 0;
  let opponentWins = 0;
  let connectionTracking = 0;
  var gameStatus = "";
$("#thisplayerInfo").html("<h3>Wins: " + wins +"</h3>");
$("#opponentInfo").html("<h3>Opponent Wins: " + OpponentWins +"</h3>")
  $("#start").hide();
  //Connection references
  connectedStatus.on("value", function(snapStatus){
      if(snapStatus.val()){
          var currentConnection = connections.push(true);
          currentConnection.onDisconnect().remove();
          
      }
  })
  
connections.once("value", function(snapConnections){
    numOfConnections = snapConnections.numChildren();
        //this is where we establish ability to play
    if(numOfConnections === 1){
        $("#playerInfo").text("You are player 1");
            playerturn = 1;
            opponent = 2;
            
    }else if(numOfConnections === 2){
        $("#playerInfo").text("You are player 2");
            playerturn = 2;
            opponent = 1;
            database.ref("/gamestatus").set({game:"in-progress"});
    }
        if(numOfConnections > 2){
            alert("I'm sorry, you'll have to wait your turn")
        }
})
function reEstablishPlayers(){
    connections.once("value", function(snapConnections){
    numOfConnections = snapConnections.numChildren();
        //this is where we establish ability to play
    if(numOfConnections === 1){
        $("#playerInfo").text("You are player 1");
            playerturn = 1;
            opponent = 2;
            
    }else if(numOfConnections === 2){
        $("#playerInfo").text("You are player 2");
            playerturn = 2;
            opponent = 1;
            database.ref("/gamestatus").set({game:"in-progress"});
    }
        if(numOfConnections > 2){
            alert("I'm sorry, you'll have to wait your turn")
        }
})
}
database.ref("/gamestatus").on("value", function(stat){
                    gameStatus = stat.val().game;
                })
database.ref("/playerData").on("value", function(data){
    data.forEach(function(child){
        if(thisPlayerName === child.val().name){
            wins = child.val().wins;
            console.log(wins)
        }
    })
    numData = data.numChildren();
    if(numData === 1 && gameStatus === "in-progress"){
        endGame();
    }
})
connections.on("value", function(snap){
      let num = snap.numChildren();
      if(num < 2 && gameStatus === "in-progress"){
          console.log("someone logged out")
      }
  })
  //Establish turn
database.ref("/turn").on("value", function(snapshot){
       turn = snapshot.val().turn;
       $("#turnLabel").text("It's player " + turn +"'s turn");
          if(turn === playerturn){
              $("#buttonGroup").show();
          }else{
              $("#buttonGroup").hide();
          }      
  })
function returnResult(){
    database.ref("/results").on("value", function(resultSnap){
    if(resultSnap.numChildren() > 0){
    results = resultSnap.val().results;
    $("#results").text(results);
    }
    
})
}
function populateChatDive(){
    database.ref("/chat").on("value", function(chatSnap){
        $("#chatWindow").empty();
    chatSnap.forEach(function(child){
        $("#chatWindow").append(child.val() + "<br>");
    })
    })

}
function chat(){
    let currentChat = $("#chatBox").val();
database.ref("/chat").push(currentChat);
populateChatDive();
$("#chatBox").val('');
}
database.ref("/choices").on("value", function(compareChoices){
    guessNumber = compareChoices.numChildren();
        if(turn === 1 && guessNumber === 2){
    compareChoices.forEach(function(child){
            if(child.val().user !== thisPlayerName){
            opponentChoice = child.val().choice; 
            opponentName = child.val().user;
            }
            if(opponentChoice === "Rock" && currentChoice === "Scissors"){
                database.ref("/results").set({results:opponentName + "wins!!"});
                OpponentWins++;
                Losses++;
                returnResult();
            }else if(opponentChoice === currentChoice){
                database.ref("/results").set({results: "Tie!"});
                ties++;
                returnResult()
            }else if(opponentChoice === "Scissors" && currentChoice === "Paper"){
                database.ref("/results").set({results:opponentName + "wins!!"});
                Losses++;
                OpponentWins++;
                returnResult();
            }else if(opponentChoice === "Paper" && currentChoice === "Rock"){
                database.ref("/results").set({results:opponentName + "wins!!"});
                OpponentWins++;
                Losses++;
                returnResult();
            }
            else if(currentChoice === "Rock" && opponentChoice === "Scissors"){
                database.ref("/results").set({results:thisPlayerName + "wins!!"});
                OpponentLosses++;
                wins++;
                
                returnResult();
            }else if(currentChoice === "Scissors" && opponentChoice === "Paper"){
                database.ref("/results").set({results:thisPlayerName + "wins!!"});
                wins++;
                OpponentLosses++;
                returnResult();
            }else if(currentChoice === "Paper" && opponentChoice === "Rock"){
                database.ref("/results").set({results:thisPlayerName + "wins!!"});
                OpponentLosses++;
                wins++;
                returnResult();
            }
            
        })
        database.ref("/choices").set({});
        
    }
    
})
function recordAnswer(){
    $("#results").text('');
    currentChoice = $(this).text();
    database.ref("/turn").set({turn: opponent});
    database.ref("/choices").push({user: thisPlayerName, choice: currentChoice});
}

function endGame(){
    database.ref("/chat").set({});
    database.ref("/results").set({});
    database.ref("/turn").set({turn: 1});
    database.ref("/choices").set({});
    $("#results").text('');
    database.ref("/gamestatus").set({game:"disconnected"});
    reEstablishPlayers()
}
$("#submitChat").on("click", chat);
$("#reset").on("click", endGame);
$(".choice").on("click", recordAnswer);

populateChatDive();

function start(){
    $("#start").show();
}
  //capture user info
  function submitName(){
      thisPlayerName = $("#name").val();
      $("#name").hide()
      let userInfoConnection = database.ref("/playerData").push({user: thisPlayerName, wins:0,losses:0});
       database.ref("/playerData").once("value", function(snapshot){
        let numOfPlayers = snapshot.numChildren();
        let userToRemove = snapshot.val();
        snapshot.forEach(function(child){
            let childName = child.val().user;
            if(childName === thisPlayerName){
                userInfoConnection.onDisconnect().remove();
            }
        })
     })
     start();
  }
$("#submitName").on("click", submitName)