/*
* Javascript del generador y verificador de MT
*
* */

$(document).ready(function () {
  /**
   * Variables globales
   * */
   var estados = []; //Array de Estados
   var transiciones = {}; //Objeto transiciones que contiene objetos Transicion

   // Insertamos el estado inicial por defecto (no borrable)
   estados.push(new Estado('q0'));

   /*
   * Clases
   * */

  function Estado(nombre){
    this.nombre = nombre;
    this.esFinal = false;
  }

  function Transicion(array){
    this.estadoOrigen = array[0].value;
    this.estadoDestino = array[1].value;
    this.simbEntrada = array[2].value;
    this.simbSalida = array[3].value;
    this.direccion = array[4].value;
  }


  /*
  * Funciones principales del generador y verificador
  * */

  // Comprueba la cadena de entrada
  // ----------------------------------------------------*/
  function comprobarCadena(cadena){

    const blanco = '\u25cf';
    var aceptada = false;
    // Se establecen 3 estados de parado
    // 0: No parado
    // 1: parado por no encontrar más transiciones
    // 2: Parado por sobrepasar el tiempo máximo de ejecución
    var parado = 0;
    var estadoActual = 'q0';
    var log = ''; //String donde guarda los pasos seguidos durante la comprobación
    var paso = 1;

    //convertimos el string cadena en un array de strings
    var cinta = cadena.split("");
    var posCinta = 0;
    var tiempoInicial = new Date().getTime();
    var tiempoTrans = 0;
    const maxTiempo = 6000;

    while (parado == 0){ // Mientras no se haya parado la MT
      //lee un simbolo de la cinta
      var carLeido = cinta[posCinta];
      log += '<b>Paso '+ paso +':<br></b>';
      log += 'Lee ' + carLeido +'<br>';

      //Buscamos que exista una transicion para el estado con el simbolo de entrada leído
      var idTrans = estadoActual + carLeido;
      var trans = transiciones[idTrans];
      if(trans == undefined ) { //Lista de transiciones que coincide no encontrada
        parado = 1;
        log += 'Transición no encontrada. MT parada.<br>';
      }else{
        var direccion = trans.direccion;
        var nuevoSimb = trans.simbSalida;
        estadoActual = trans.estadoDestino;
        log += 'Transita a estado '+estadoActual+'.<br>';
        cinta[posCinta] = nuevoSimb;
        log += 'Escribimos '+nuevoSimb+'';

        if(direccion == 'R') { //avanzamos hacia la dcha de la cinta
          log += ' y avanza hacia la derecha.<br>';
          if(posCinta+1 == cinta.length) { //si la nueva posicion en la cinta supera a su longitud original
            if(cinta.length == 1 && cinta[0] === blanco) {
              log += 'Cinta vacía.<br>';
            }else{
              cinta.push(blanco);
              posCinta++;
            }
          }else if(posCinta == 0){ // Si estamos al inicio de la cinta
            if(nuevoSimb == blanco) {
              cinta.shift();
              log += 'Se borra espacio del principio.<br>';
            }else{
              posCinta++;
            }
          }else{
            posCinta++;
          }
        }else if(direccion == 'L'){ //si retrocede a la izquierda
          log += ' y avanza hacia la izquierda.<br>';
          if(posCinta == 0){ //si estamos de en el inicio de la cinta
            if(cinta.length == 1 && cinta[0] === blanco) {
              log += 'Cinta vacía.<br>';
            } else {
              cinta.unshift(blanco);
              posCinta = 0;
            }
          }else if(posCinta+1 == cinta.length){ //Si avanza hacia la izquierda y estamos en la última posición de la cinta
            if(cinta[posCinta] == blanco) {
              cinta.pop(); //Si es un blanco, se borra
              log += "Se borra espacio del final.<br>";
              posCinta--;
            }else{
              posCinta--;
            }
          }else{
            posCinta--;
          }
        } else {
          log += ' y no avanza en la cinta.<br>';
        }
        log += 'Estado de la cinta: '+ cinta + '.<br>';
        log += 'Actual posición del cabezal: '+posCinta +'.<br><br>';

        tiempoTrans = (new Date().getTime()) - tiempoInicial;
        if (tiempoTrans > maxTiempo) {
          parado = 2;
          log = "Ha transcurrido el tiempo máximo de ejecución ("+ maxTiempo +"ms) de la MT.<br> Por favor, revisa las transiciones de la MT.<br>";
        }
        paso++;
      }
    }

    // Si ha parado y no sido por sobrepasar el maxTiempo
    if (parado == 1) {
      var estadoFinal = $.grep(estados, function(n){
        return n.nombre == estadoActual;
      });

      if(estadoFinal[0].esFinal){
        aceptada = true;
        log += 'Último estado es final. MT aceptada.';
      }

      var tipo = 'reconocedor';

      // Comprobamos si es un MT reconocedor o transductor
      if($('#switchMT').is(':checked')){
        tipo = 'transductor';
      }

      if(tipo == 'transductor'){
        // Agregamos lo que queda de la cinta en el estado final y la leemos desde la cabecera
        if(posCinta!=0){
          log+='<br>Aviso: la lectura de la cinta no empieza en la posición inicial.<br>';
        }
        aceptada = '';
        for(var i=posCinta; i < cinta.length; i++) {
          aceptada+=cinta[i];
        }
      }
    }

    // Borra y escribe los datos del registro de pasos
    $('.log').empty().html(log);

    return aceptada;
  }

  // Guarda la MT
  /* ----------------------------------------------------
  // 1.  Se crea el array donde se almacenan los estados y transiciones y lo convertimos a JSON
  // 2.  Comprueba que el navegador es compatible con la API necesaria para guardar el JSON
  // 2.1 Si lo es, crea los objetos Blob y FileReader necesarios para guardar el archivo
  // 3.  Si no lo es, lanza un mensaje al usuario
  /* ------------------------------------------------------------------------------------------- */
  function guardarMT(){
    var jsonData = []; //[1]
    jsonData.push(estados);
    jsonData.push(transiciones);
    jsonData = JSON.stringify(jsonData);

    if ( APIcompatible() ) { //[2]
      //[2.1]
      var data = new Blob([jsonData], {
        type: 'application/json'
      });
      var reader = new FileReader();
      reader.onload = function(event) {
        //configuración del archivo
        var save = document.createElement('a');
        save.href = event.target.result;
        save.target = '_blank';
        save.download = 'archivo.json';

        //evento que llama a la ventana del explorador de archivos
        var clickEvent = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
        });
        save.dispatchEvent(clickEvent);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
      };
      reader.readAsDataURL(data);
    } else {
      mostrarAlert('API de guardado no compatible para este navegador.'); //[3]
    }
  }


  // Carga la MT
  /* -------------------------------------------------------------------------------
  // 1. Comprueba si el API es compatible con el navegador
  // 2. Hacemos trigger en el input que carga la ventana del explorador de archivos
  // ---------------------------------------------------------------------------------- */
  function cargarMT(){
    if( APIcompatible() ) { //[1]
      $('#cargarMT').trigger('click'); //[2]
    }else{
      mostrarAlert('API FileRader no compatible con este navegador.')
    }
  }


  /*
  * Funciones auxiliares
  * */

  // Quita alertas anteriores y muestra una nueva
  // -----------------------------------------------------------------

  function mostrarAlert(msg,type) {
    var type = (type == undefined || '')? 'danger': type;
    $('.alert').remove();
    var message = '<div class="alert alert-dismissable alert-'+type+'">'+
        '<a href="#" class="close closeModal" aria-label="close">&times;</a>'+
        msg + '</div>';
    $('#formCadena').prepend(message);
    $('#formCadena .alert').fadeIn('slow');
  }

  // Comprueba que el navegador es valido para la API FileReader y devuelve el resultado en boolean
  // -------------------------------------------------------------
  function APIcompatible(){
    return (window.File && window.FileReader && window.FileList && window.Blob);
  }


  // Lee los archivos JSON
  // --------------------------------------------
  function leerArchivo(e){
    var archivo = e.target.files[0];
    if (!archivo) {
      return;
    }

    var lector = new FileReader();
    lector.onload = function(e) {
      var contenido = e.target.result;
      cargarContenido(contenido);
    };
    lector.readAsText(archivo);
  }


  // Procesa el archivo JSON
  // -------------------------------
  function cargarContenido(contenido){
    //Validamos que sea un JSON correcto
    if (isJSONString(contenido)){
      var dataJSON = JSON.parse(contenido);
    }else{
      //alert('El archivo no contiene un JSON correcto.')
      mostrarAlert('El archivo no contiene un JSON correcto.');
      return false;
    }

    // Sobreescribe las variables globales de estados y transiciones
    estados = dataJSON[0];
    transiciones = dataJSON[1];

    //Valida el formato de las variables generadas a partir de ese JSON
    if(dataJSON.length == 2 && $.isArray(dataJSON)){
      if (!comprobarEstados(estados)) {
        return false;
      }

      if (!comprobarTransiciones(transiciones)) {
        return false;
      }

    }else {
      //alert('Formato del JSON no válido.');
      $('.msgError').html('Formato del JSON no válido.');
      $('#modalError').modal();
      return false;
    }

    // Tabla de estados y formularios de agregar nueva transicion
    $('.tablaEstados tbody').empty();

    $('#origen, #destino')
      .selectpicker('destroy')
      .empty();

    var html= '';
    var options = '';
    var checked = '';
    var trFinal = '';
    var optionFinal = '';

    for (var i in estados) {
      // Comprueba si es un estado final o no
      if(estados[i].esFinal){
        checked = 'checked';
        trFinal = 'warning';
        optionFinal = 'option--final';
      } else {
        checked = '';
        trFinal = '';
        optionFinal = '';
      }

      html += '<tr class="'+trFinal+'"><td>'+estados[i].nombre+'</td><td>';
      html += '<div class="checkbox-rotate"><label class="input-checkbox">';
      html += '<input type="checkbox" name="esFinal-'+i+'" id="esFinal-'+i+'" data-num="'+i+'" '+checked+'/>';
      html += '<span class="spanCheck"></span>';
      html += '</label></div></td></tr>';

      options += '<option class="'+optionFinal+'" data-tokens="'+i+' q'+i+'" value="q'+i+'">q'+i+'</option>';
    }
    $('.tablaEstados tbody').html(html);
    $('#origen, #destino').append(options).addClass('selectpicker');
    $('#origen, #destino').selectpicker('refresh');

    // Tabla de transiciones y sus formularios
    $('.tablaTrans tbody').empty();

    // Si transiciones está vacío
    var transLength= Object.keys(transiciones).length;
    if( transLength == 0 ){
      var html = '<tr id="sinTrans"><td colspan="6">Sin transiciones</td></tr>';
      $('.tablaTrans tbody').html(html);
    }else{
      $.each(transiciones, function (i) {
        var trans = transiciones[i];
        var html = '<tr><td>'+ trans.estadoOrigen +'</td>'
                + '<td>'+ trans.estadoDestino +'</td>'
                + '<td>'+ trans.simbEntrada +'</td>'
                + '<td>'+ trans.simbSalida +'</td>'
                + '<td>'+ trans.direccion +'</td>'
                + '<td class="tdRemove"><i class="removeTrans fa fa-trash-o" aria-hidden="true"></i></td>'
                + '</tr>';
        $('.tablaTrans tbody').append(html);
      });
    }
  }

  // Comprueba que sea un JSON
  // ---------------------------------------
  function isJSONString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }


  // Obtiene los values de un objeto.
  // Requerido para corregir la incompatibilidad con IE
  // --------------------------------------------------
  function objectValues(obj) {
    var res = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        res.push(obj[i]);
      }
    }
    return res;
  }


  // Comprueba si el formato de los estados obtenidos en el JSON sean correctos
  // ---------------------------------------------------------------------------
  function comprobarEstados(estados){
    var validado = true;
    var msg = '';

    for (var i in estados) {
      var est = estados[i];

      // Verificamos que el contenido de estados sean objetos
      if( typeof(est) == 'object' ) {
        var keys = Object.keys(est);
        var values = objectValues(est);

        if( keys[0] == 'nombre' ){
          validado = comprobarEstado(values[0]);

          if (!validado) {
            //alert('Estado '+i+' no tiene un nombre válido');
            $('.msgError').html('Estado '+i+' no tiene un nombre válido.');
            $('#modalError').modal();
            return false;
          }else {
            // Obtenemos el número del estado al quitarle q
            var num = values[0].slice(1,values[0].length);
            if( i != num) {
              msg = 'Error: Estados no ordenados en orden ascendente.';
              validado = false;
            }
          }

          // Comprueba que el segundo campo sea el de esFinal y tipo booleano
          if( keys[1] == 'esFinal') {
            if( !typeof(values[1]) == 'boolean' ) {
              msg = 'JSON contiene un estado que no ha guardado bien esFinal (boolean)';
              validado = false;
            }
          } else {
            msg = 'JSON contiene un objeto con un key no válido.';
            validado = false;
          }

        } else {
          msg = 'JSON contiene un objeto con un key no válido.';
          validado = false;
        }

      } else {
        msg = "JSON contiene un elemento que no es un objeto";
        validado = false;
      }
      if(!validado){
        $('.msgError').html(msg);
        $('#modalError').modal();
        return false;
      }
    }
    return validado;
  }


  // Comprueba formato de un estado
  // -----------------------------------
  function comprobarEstado(val) {
    var rule = /q[0-9]+$/;
    return rule.exec(val);
  }


  // Comprueba que las transiciones obtenidas del JSON sean correctas
  // -----------------------------------------------------------------
  function comprobarTransiciones(trans) {
    var validado = true;
    var msg = '';
    var trNoVal = 'JSON contiene una transición no válida.';
    var nombres = ['estadoOrigen', 'estadoDestino', 'simbEntrada', 'simbSalida', 'direccion'];

    for(var i in trans) {
      var t = trans[i];

      // Verificamos que el contenido de transiciones sean objetos
      if ( typeof(t) == 'object' ) {
        var keys = Object.keys(t);
        var values = objectValues(t);

        for (var j in keys) {
          if (keys[j] == nombres[j]){
            switch (keys[j]) {
              case 'estadoOrigen', 'estadoDestino':
                validado = comprobarEstado(values[j]);
                if (!validado) {
                  msg+= keys[j] + ' no válido en una de las transiciones';
                }
                break;
              case 'simbEntrada', 'simbSalida':
                var noValido = /[^a-zA-Z0-9#\u25cf]$/;
                validado = !noValido.exec(values[j]);
                if(!validado) {
                  msg+= keys[j] + ' no válido en una de las transiciones';
                }
                break;
              case 'direccion':
                if ( values[j] != 'R' && values[j] != 'L' && values[j] !== 'S') {
                  validado = false;
                  msg+= keys[j] + ' no válido en una de las transiciones';
                }
                break;
            }

            if(!validado){
              //alert(msg);
              $('.msgError').html(msg);
              $('#modalError').modal();
              return validado;
            }

          } else {
            msg = trNoVal;
            //alert(msg);
            $('.msgError').html(msg);
            $('#modalError').modal();
            return false;
          }
        }


        // Comprueba que la key corresponde con la composicion del estadoOrigen y simbEntrada
        var id = values[0] + values[2];
        if(i != id) {
          msg = trNoVal;
          //alert(msg);
          $('.msgError').html(msg);
          $('#modalError').modal();
          return false;
        }

      } else {
        msg = "JSON contiene un elemento que no es un objeto";
        //alert(msg);
        $('.msgError').html(msg);
        $('#modalError').modal();
        validado = false;
      }
    }

    return validado;
  }


  // Valida una transición nueva y la agrega si es así
  // --------------------------------------------------
  function validarTransicion(trans){
    var valido = false;
      var id = trans[0].value + trans[2].value;

      // Comprueba que no existe la nueva transicion
      var transBuscado = transiciones[id];

      // Si no es encontrado, es decir, es undefined, se crea y se valida
      if(transBuscado == undefined){
        transiciones[id] = new Transicion(trans);
        valido = true;
      }
    //}

    return valido;
  }


  /*
  * Eventos
  * */

  // Agrega un estado nuevo al MT
  //----------------------------------------
  $('.addState').on('click', function(){
    var num = estados.length;
    estados.push(new Estado('q'+num));

    // Actualizamos tabla de estados
    var html = '<tr>'
      + '<td>q'+num+'</td>'
      + '<td><div class="checkbox-rotate"><label class="input-checkbox">'
      + '<input type="checkbox" name="esFinal-'+num+'" id="esFinal-'+num+'" data-num="'+num+'"/>'
      + '<span class="spanCheck"></span>'
      + '</label></div></td>'
      + '</tr>';
    $('.tablaEstados tbody').append(html);

    // Se actualizan los select también
    var option = '<option data-tokens="'+num+' q'+num+'" value="q'+num+'">q'+num+'</option>';
    $('#origen').append(option).selectpicker('refresh');
    $('#destino').append(option).selectpicker('refresh');
  });


  // Borra el último estado de la lista de estados
  // ----------------------------------------------------*/
  $('.deleteState').on('click', function(){
    // Cierra modal
    $('#modalBorrarEstado').modal('hide');

    // Número de estados actual
    var num = estados.length - 1;

    // Borra el estado del array
    estados.pop();

    // Actualiza la tabla de estados
    $('.tablaEstados tbody tr').last().remove();

    // Actualiza los select de estados
    $('#origen').find("[value='q"+ num + "']").remove();
    $('#origen').selectpicker('refresh');
    $('#destino').find("[value='q"+ num + "']").remove();
    $('#destino').selectpicker('refresh');

    // Borra las transiciones asociadas a ese estado en la tabla y la variable transiciones
    $('.tablaTrans tbody tr').each(function(){
      //Busca las columnas de cada fila
      $(this).children('td').each(function(i){
        switch (i) {
          case 0: //Si al leer el estado origen, coincide con el estado borrado
            var estadoOrigen = $(this).text();
            if (estadoOrigen == 'q'+num) {
              //Se busca la transicion y se borra de la variable y la tabla de transiciones
              var simbEntrada = $(this).next().next().text();
              var id = estadoOrigen+simbEntrada;
              delete transiciones[id];
              $(this).parent().remove();
            }
          break;
          case 1: //Si coincide pero con el estado destino
            var estadoDestino = $(this).text();
            if(estadoDestino == 'q'+num) {
              var estadoOrigen = $(this).prev().text();
              var simbEntrada = $(this).next().text();
              var id = estadoOrigen+simbEntrada;
              delete transiciones[id];
              $(this).parent().remove();
            }
          break;
        }
      });
    });

    // Si la tabla se queda vacía, es decir, se han borrado todas las transiciones
    if(Object.keys(transiciones).length == 0){
      var html = '<tr id="sinTrans"><td colspan="6">Sin transiciones</td></tr>';
      $('.tablaTrans tbody').html(html);
    }
  });

  // Abre el modal de confirmado de borrado del último estado
  // Antes evalúa si hay más de un estado, si solo hubiese uno, sería el inicial
  // y no es borrable.
  // ----------------------------------------------------------
  $('.confirmDeleteState').on('click', function() {
    if(estados.length > 1) {
      $('#modalBorrarEstado').modal();
    } else {
      $('.msgError').html('No se puede eliminar el estado inicial (q<sub>0</sub>).');
      $('#modalError').modal();
    }
  });


  // Actualiza el estado de final a no final y viceversa
  /* ---------------------------------------------------------
  // 1.  Comprueba si está seleccionado el checkbox
  // 2.  Si lo está, actualiza a final el estado
  // 2.1 Y si no, a no final
  // 3.  Modifica la fila y las opciones donde se encuentran
  // ---------------------------------------------------------*/
  $(".tablaEstados").on('click', "input[type='checkbox']", function(){
    var num = $(this).attr('data-num');

    if ($(this).is(':checked')) { //[1]
      estados[num].esFinal = true; //[2]
      //------------------------------------------- [3]
      $(this).parents('tr').addClass('warning');
      $('#origen, #destino').find("[value='q"+ num + "']").addClass('option--final');
    }else{
      estados[num].esFinal = false; //[2.1]
      //------------------------------------------- [3]
      $(this).parents('tr').removeClass('warning');
      $('#origen, #destino').find("[value='q"+ num + "']").removeClass('option--final');
    }
    $('#origen, #destino').selectpicker('refresh');
  });


  // Inserta un espacio en blanco en el campo seleccionado
  // ----------------------------------------------------------
  $('.insertSpace').on('click', function(){
    $(this).prev().val('\u25cf');
  });


  // Crea y agrega una transición
  /* ---------------------------------
  // 1.  Serializa campos de la transición en un array de objetos
  // 2.  Se comprueba que no ha quedado ningún campo vacío
  // 2.1 Si no es campo vacío, se agrega a la variable html para pintarlo posteriormente
  // 3.  Pero si es vacía, controlamos que se ha quedado un campo vacío.
  // 4.  Una vez verifica que es una transicion completa,
  //     pasa a las siguientes fases de verificacion de una transicion
  // 5.  Si la transición es válida, es agregada.
  // ---------------------------------------------------------------------------------------*/
  $('.addTransition').on('click', function(e){
    e.preventDefault();
    var trans = $('.formTransicion').serializeArray(); //[1]
    var transCompleta = true;
    var html = '<tr>';

    $.each(trans, function(i, prop){
      if(prop.value!=='') { //[2]
        html += '<td>'+prop.value+'</td>';
      }else{ //[3]
        //alert('Transición incompleta.');
        $('.msgError').html('Transición incompleta.');
        $('#modalError').modal();
        transCompleta = false;
        return false;
      }
    });
    html += '<td class="tdRemove"><i class="removeTrans fa fa-trash-o" aria-hidden="true"></i></td></tr>';

    if(transCompleta) { //[4]
      var transValido = validarTransicion(trans);
      if(transValido){ //[5]
        $('#sinTrans').remove();
        $('.tablaTrans tbody').append(html);
      }else{
        $('.msgError').html('Transición no válida o repetida.');
        $('#modalError').modal();
      }
    }
  });


  // Borra una transicion
  // -------------------------------------------
  $('.tablaTrans').on('click', '.removeTrans', function(e){
    e.preventDefault();
    // Buscamos el id de la transicion a borrar y la borramos de la lista de transiciones
    var trans = $(this).parent().siblings();
    var transId = trans[0].innerText + trans[2].innerText;
    delete transiciones[transId];

    // Se borra de la tabla y si quedase vacía, se agrega que no hay transiciones
    $(this).parent().parent().remove();
    if(Object.keys(transiciones).length == 0){
      var html = '<tr id="sinTrans"><td colspan="6">Sin transiciones</td></tr>';
      $('.tablaTrans tbody').html(html);
    }
  });


  // Comprobar cadena de texto introducida
  /* ------------------------------------------------------------------
  // 1.  Eliminamos posibles espacios en blanco del campo de entrada
  // 2.  Si es cadena vacía, añadimos un espacio en blanco a la cinta
  // -----------------------------------------------------------------*/
  $('.comprobarCadena').on('click', function(e){
    e.preventDefault();

    if(Object.keys(transiciones).length == 0) {
      mostrarAlert('La MT de no tiene transiciones.');
      return false; //salimos de la función
    }

    var cadena = $.trim($('#cadena').val()); //[1]

    if (cadena.length == 0) { //[2]
      cadena = '\u25cf';
    }

    var aceptado = comprobarCadena(cadena);
    if( typeof(aceptado)=="boolean" ){
      var resultado = aceptado ? 'aceptada' : 'no aceptada';
    }else {
      var resultado = aceptado;
    }
    $('.result').html('Resultado: '+resultado);
    $('#result').fadeIn('slow');

  });


  // Muestra el log de como se ha comprobado la cadena
  $('.mostrarLog').on('click', function(e){
    e.preventDefault();
    $('#log').modal();
  });


  // Guarda MT
  //------------------------------------------
  $('.guardarMT').on('click', function(e){
    e.preventDefault();
    guardarMT();
  });

  // Carga MT
  //------------------------------------------
  $('.cargarMT').on('click', function(e){
    e.preventDefault();
    $('#result').hide();
    cargarMT();
  });

  // Cuando se cargue un archivo, procede a leerlo y procesarlo
  // -----------------------------------------
  $('#cargarMT').on('change',leerArchivo);

  // Animación en el cierre de alerts
  // --------------------------------------------
  $('#formCadena').on('click', '.closeModal', function(e){
    e.preventDefault();
    $(this).parent().fadeOut('slow');
  });

});