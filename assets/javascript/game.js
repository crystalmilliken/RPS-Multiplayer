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
$(".choice").attr('disabled','disabled');
function startGame(name){
    $("#nameData").hide();
    let players = [];
    let turn = 1;
    let database = firebase.database();
    let connections = database.ref("/connections");
    let connectedStatus = database.ref(".info/connected");
    let opponentName = "";
    let wins = 0;
    let OpponentWins = 0;
    let guessNumber = 0;
    let results = "";
    let currentChoice = "";
    let opponentChoice = "";
  
  let OpponentLosses = 0;
  let losses = 0;
  let ties = 0;
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
           
    }
        if(numOfConnections > 2){
            alert("I'm sorry, you'll have to wait your turn")
        }
})
// database.ref("/playerData/" + name).on("value", function(data){
    
//     data.forEach(function(child){
//         console.log(child.val())
//         child.val().set({wins: wins})
//     //     if(name === child.val().name){
//     //         wins = child.val().wins;
//     //         console.log(wins)
//     //     }else if(name !== child.val().name){
//     //         opponentWins = child.val().wins;
//     //     }
//     })
// })
database.ref("/playerData").on("value", function(userInfo){
    userInfo.forEach(function (k){
        if(k.key !== name){
            console.log(k.val().wins)
            OpponentWins = k.val().wins;
            $("#opponentInfo").html("<h3>" + opponentName + " Wins: " + OpponentWins +"</h3>");
        }
    })
})
database.ref("/playerData").on("child_added", function(child){
    let testOpponentName = child.key
     if(testOpponentName !== name){
        opponentName = testOpponentName;
        $("#opponentInfo").html("<h3>" + opponentName + " Wins: " + OpponentWins +"</h3>");
    }
})

function reset(){
    OpponentWins = 0;
    $("#nameData").show();
    $("#opponentInfo").html("<h3>" + opponentName + " Wins: " + OpponentWins +"</h3>");
    $("#opponentInfo").text("Waiting on second player");
    database.ref("/playerData/" + name).set({wins:0, losses:0})
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
        }
        if(numOfConnections > 2){
            alert("I'm sorry, you'll have to wait your turn")
        }
    })
    database.ref("/chat").set({});
    database.ref("/results").set({});
    database.ref("/turn").set({turn: 1});
    database.ref("/choices").set({});
    $("#results").text('');
    database.ref("/gamestatus").set({game:"disconnected"});

}
database.ref("/playerData").on("child_removed", function (snap){
        console.log("someone logged out");
        reset();
   
});
function createUser(name){
      let userInfoConnection = database.ref("/playerData/" + name);
      userInfoConnection.set({wins:0,losses:0});
       database.ref("/playerData/"+ name).once("value", function(snapshot){
        let numOfPlayers = snapshot.numChildren();
        let userToRemove = snapshot.val();
        userInfoConnection.onDisconnect().remove();
            
     })
}
database.ref("/turn").on("value", function(snapshot){
       turn = snapshot.val().turn;
       $("#turnLabel").text("It's player " + turn +"'s turn");
          if(turn === playerturn){
              $(".choice").removeAttr('disabled');
          }else{
              $(".choice").attr('disabled','disabled');
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
            if(child.val().user !== name){
            opponentChoice = child.val().choice; 
            opponentName = child.val().user;
        }
        })
            if(opponentChoice === currentChoice){
                database.ref("/results").set({results:currentChoice + " ties with " + opponentChoice});
                ties++;
            }
            else if(currentChoice === "Rock" && opponentChoice === "Scissors"){
                database.ref("/results").set({results:currentChoice + " beats " + opponentChoice});
                OpponentLosses++;
                wins++;
                $("#thisplayerInfo").html("<h3>" + name + " Wins: " + wins +"</h3>");
                database.ref("/playerData/" + name).set({wins:wins, losses:losses});
            }else if(currentChoice === "Scissors" && opponentChoice === "Paper"){
                database.ref("/results").set({results:currentChoice + " beats " + opponentChoice});
                wins++;
                OpponentLosses++;
                $("#thisplayerInfo").html("<h3>" + name + " Wins: " + wins +"</h3>");
                database.ref("/playerData/" + name).set({wins:wins, losses:losses});
            }else if(currentChoice === "Paper" && opponentChoice === "Rock"){
                database.ref("/results").set({results:currentChoice + " beats " + opponentChoice});
                OpponentLosses++;
                wins++;
                $("#thisplayerInfo").html("<h3>" + name + " Wins: " + wins +"</h3>");
                database.ref("/playerData/" + name).set({wins:wins, losses:losses});
            }
         returnResult();   
        $("#opponentInfo").html("<h3>" + opponentName + " Wins: " + OpponentWins +"</h3>");
        database.ref("/choices").set({});
        currentChoice ="";
    }
    
})  
function recordAnswer(){
    $("#results").text('');
    currentChoice = $(this).text();
    database.ref("/turn").set({turn: opponent});
    database.ref("/choices").push({user: name, choice: currentChoice});
}
createUser(name);  
$("#submitChat").on("click", chat);
$("#reset").on("click", reset);
$(".choice").on("click", recordAnswer);

populateChatDive();
$("#thisplayerInfo").html("<h3>" + name + " wins: " + wins +"</h3>");
$("#opponentInfo").html("<h4>Waiting on Opponent</h4>");

}
 function submitName(){
      let thisPlayerName = $("#name").val();
      $("#userData").hide();
      startGame(thisPlayerName);
  }
$("#submitName").on("click", submitName)
