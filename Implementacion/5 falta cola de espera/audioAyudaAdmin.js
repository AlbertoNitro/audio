// JavaScript Document
var miEasyrtcId = "";
var usuarioUltimoContactado = new Array(1);
var ultimoUsuario = "";
var nombreAPP = "telefonos"; // Se indica el card sorting concreto para conectar entre si a los usuarios
var usuariosConectados = new Array();


// generar una cola de llamadas en espera al administrador. Indicarle al que llama cuantas personas hay delante suya que tambien necesitan ayuda. Darle la opcion de abandonar la cola (cuidado si se desconecta y estaba en la cola) 

// poder hablar con todos los participantes a la vez

function disable(domId) {
  document.getElementById(domId).disabled = "disabled";
}
 
function enable(domId) {
  document.getElementById(domId).disabled = "";
}

function loginExito(easyrtcid) {
  disable("botonConectar");
  enable("botonDesconectar");
  enable("usuariosConectados");
  document.getElementById("textoSpan").style.display = "inline";
  miEasyrtcId = easyrtc.idToName(easyrtcid);
  document.getElementById("iam").innerHTML = "CONECTADO, Bienvenido " + easyrtc.idToName(easyrtcid);
}
 
function loginFallo(codigoError, message) {
  easyrtc.showError(codigoError, message);
}

function conectar() {
	console.log("conectar().");
  	console.log("Estableciendo Puerto.");
  	easyrtc.setSocketUrl("//localhost:8080");
   	console.log("Desactivando el video.");
  	easyrtc.enableVideo(false); // Por defecto excluye el video si ponemos false
  	easyrtc.enableVideoReceive(false);
   	console.log("Funcion que se llamara cada vez que haya un cambio en la sala.");
   	easyrtc.setRoomOccupantListener(convertListToButtons);
	console.log("Iniciando acceso al microfono o camara.");
	easyrtc.setUsername("Jaime Urquiza");
  	easyrtc.initMediaSource(
		function(){    // success callback
		  easyrtc.connect(nombreAPP, loginExito, loginFallo);
		},
		function(codigoError, errmesg){
		  easyrtc.showError(codigoError, errmesg);
		}  // failure callback
		);
	
}

function colgarTodos() {
 	easyrtc.hangupAll();
 }

function colgarUsuario(otroEasyrtcId) {
 	easyrtc.hangup(otroEasyrtcId);
 }
 
//function terminatePage() {
//  easyrtc.disconectar();
//}
 
function clearConnectList() {
	console.log("clearConnectList().");
  	var otherClientDiv = document.getElementById("usuariosConectados");
  	while (otherClientDiv.hasChildNodes()) {
    	otherClientDiv.removeChild(otherClientDiv.lastChild);
  	}
}
 
 
function convertListToButtons (roomName, occupants, isPrimary) {
  console.log("YO SOY: " + easyrtc.myEasyrtcid);
  console.log("convertListToButtons().");
  clearConnectList();
  var otherClientDiv = document.getElementById("usuariosConectados");
  for(var easyrtcid in occupants) {
  	console.log("USUARIO= " + easyrtcid);
  	usuariosConectados.push(easyrtcid);
    var button = document.createElement("button");
	button.setAttribute("class", "usuario");
    button.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      };
    }(easyrtcid);
    var label = document.createElement("text");
    label.innerHTML = easyrtc.idToName(easyrtcid);
	console.log(easyrtcid + " is actually " + easyrtc.idToName(easyrtcid));
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }
}
 
 
function performCall(otroEasyrtcId) {
  console.log("performCall().");
  var acceptedCB = function(accepted, otroEasyrtcId) {
    if( !accepted ) {
      document.getElementById("infoLlamada").style.display = "block";
  	  document.getElementById("infoLlamada").textContent =easyrtc.idToName(otroEasyrtcId) +" rechazó tu llamada."; 
	  console.log("LLamada rechazada");
      enable("usuariosConectados");
    }
  };
  var successCB = function() {
  	console.log("Llamada aceptada");
    ultimoUsuario = easyrtc.idToName(otroEasyrtcId);
    enable("botonColgar");
    document.getElementById("infoLlamada").style.display = "block";
  	document.getElementById("infoLlamada").textContent ="Usted esta hablando con: " + easyrtc.getConnectionCount() + " persona/s.";
  };
  var failureCB = function() {
  	console.log("Llamada fallida");
    enable("usuariosConectados");
  };
  console.log("LLAMANDO...");
  easyrtc.call(otroEasyrtcId, successCB, failureCB, acceptedCB);
  console.log("Fin de performCall().");
}

function llamarTodos() {
	var easyrtcid;
	for (var i=0 ; i<usuariosConectados.length ; i++) {
		easyrtcid = usuariosConectados[i];
		if( easyrtc.getConnectStatus(easyrtcid) == easyrtc.NOT_CONNECTED ){
        	console.log(easyrtcid);
			performCall(easyrtcid);
    	}
	}
}
 
function desconectar() {
  document.getElementById("iam").innerHTML = "DESCONECTADO";
  enable("botonConectar");
  disable("botonDesconectar"); 
  easyrtc.disconnect();
  console.log("disconnecting from server");
  // Limpieza de elementos
  easyrtc.clearMediaStream( document.getElementById('buzonAudio'));
  easyrtc.setVideoObjectSrc(document.getElementById("buzonAudio"),"");
  easyrtc.closeLocalMediaStream();
  easyrtc.setRoomOccupantListener( function(){});
  clearConnectList();
  document.getElementById("textoSpan").style.display ="none";
}
 
easyrtc.setStreamAcceptor( function(easyrtcid, stream) { // Enlaca un elemento html como en este caso el <video> con el "buffer" stream para recibir datos con el peer dado
  var audio = document.getElementById("buzonAudio");
  easyrtc.setVideoObjectSrc(audio,stream); // Enlaca el elemento html como en este caso el <video>, con un buffer stream determinado, dependiendo de si estamo en firefox o chrome.
  enable("botonColgar");
});
 
easyrtc.setOnStreamClosed( function (easyrtcid) {
  	easyrtc.setVideoObjectSrc(document.getElementById("buzonAudio"), ""); // Desenlaza el elemento html como en este caso el <video>, ya que no le pasamos un stream, se lo quitamos. Es decir, desenlaza esa conexion que se creo entre nosotros y nuestro peer anterior, ay que la llamda se ha terminado.
  	var participantesLlamada = easyrtc.getConnectionCount();
  	document.getElementById("infoLlamada").style.display = "block";
  	if (participantesLlamada==1) 
	  	document.getElementById("infoLlamada").textContent = "Llamada con " + ultimoUsuario +" finalizada."; 
	else {
		participantesLlamada--;
		document.getElementById("infoLlamada").textContent ="Usted esta hablando con: " + participantesLlamada + " personas."
	}
});

easyrtc.setAcceptChecker(function(easyrtcid, callback) { // Funcion para decidir si aceptamos o rechazamos una llamada.
  document.getElementById("alertaLlamada").style.display = "block"; // Mostramos el bloque de alerta de que nos llaman
  if( easyrtc.getConnectionCount() > 0 ) { // Estamos ya hablando con alguien
    document.getElementById("infoAlertaLlamada").textContent = "¿ Desea colgar la llamada en curso y aceptar una nueva de " + easyrtc.idToName(easyrtcid) + " ?";
  }
  else { // No estoy hablando con nadie
    document.getElementById("infoAlertaLlamada").textContent = "¿ Aceptas la llamada de " + easyrtc.idToName(easyrtcid) + " ?";
  }
  var acceptTheCall = function(wasAccepted) {
    document.getElementById("alertaLlamada").style.display = "none";
    if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
      easyrtc.hangupAll();
    }
    callback(wasAccepted);
  };
  document.getElementById("botonResponder").onclick = function() {
    acceptTheCall(true);
    ultimoUsuario=easyrtc.idToName(easyrtcid);
  };
  document.getElementById("botonRechazar").onclick =function() {
    acceptTheCall(false);
  };
} );

function iniciar() {
		document.getElementById("botonConectar").addEventListener("click", conectar(), false);
		document.getElementById("botonDesconectar").addEventListener("click", desconectar(), false);
		document.getElementById("botonColgar").addEventListener("click", colgarTodos(), false);
		
}

window.addEventListener("load", iniciar(), false);

// Para aceptar llamadas automaticamente
// easyrtc.setAcceptChecker(function(easyrtcid, callback) {
//  callback(true);
// } );