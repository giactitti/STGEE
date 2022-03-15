/*exports.splitt=function(images,trainAccuracy,chartROC,ROC_best,AUC){

  var paletteone = ['d10e00ff', 'df564dff', 'eb958fff', 'f0b2aeff', 'ffffffff',
  'dbeaddff', '4e9956ff', '1b7b25ff', '006b0bff']

  var paletteone1 = ['D10E00','DF564D','DBEADD','006B0B']

  var colorizedVis = {min: 0.0,max: 1.0,palette: paletteone.reverse()};
  var colorizedVis1 = {min: 0.0,max: 3.0,palette: paletteone1.reverse()}

  var leftMap = ui.Map();
  leftMap.add(createLegend())
  leftMap.setControlVisibility(true);
  //leftMap.add(createview())
  var leftSelector = addLayerSelector(leftMap, 0);

  var rightMap = ui.Map();
  rightMap.add(createnumbers())
  //rightMap.add(createview())
  rightMap.add(createLegend())
  rightMap.setControlVisibility(true);
  rightMap.addLayer(images['Calibration map'],colorizedVis,'Calibration map')
  rightMap.addLayer(images['Validation map'],colorizedVis,'Validation map')
  rightMap.addLayer(images['TrueFalse'],colorizedVis1,'TrueFalse')
  rightMap.addLayer(images['Prediction map'],colorizedVis,'Prediciton map')

  var linker = ui.Map.Linker([rightMap,leftMap]);

  var splitPanel = ui.SplitPanel({
    firstPanel: leftMap,
    secondPanel: rightMap,
    orientation: 'horizontal',
    wipe: true,
  });

  ui.root.widgets().reset([splitPanel]);


  //rightMap.setCenter(13.1, 37.72604, 12);

  leftMap.setCenter(13.1, 37.72604, 12);*/




  /////////////////////////////////////////////////////////////
  // Make an inset map and add it to the linked map.
  /*var map = ui.Map({style: {position: "bottom-right"}});
  rightMap.add(map);

  // Make the little map display an inset of the big map.
  var createInset = function() {
    var bounds = ee.Geometry.Rectangle(Map.getBounds());
    map.centerObject(bounds);
    map.clear();
    map.addLayer(bounds);
  };
  createInset();
  // Get a new inset map whenever you click on the big map.
  rightMap.onChangeBounds(createInset);*/

  /////////////////////////////////////////////////////////////////////
exports.addLayerSelector = function(mapToChange, defaultValue,images,colorizedVis) {
    var label = ui.Label('Choose an image to visualize');

    // This function changes the given map to show the selected image.
    function updateMap(selection) {
      if (selection=='TrueFalse'){ mapToChange.layers().set(0,
      ui.Map.Layer(images[selection],colorizedVis1))}
      else{mapToChange.layers().set(0, ui.Map.Layer(images[selection],colorizedVis))}
    }

    // Configure a selection dropdown to allow the user to choose between images,
    // and set the map to update when a user makes a selection.
    var select = ui.Select({items: Object.keys(images), onChange: updateMap});
    select.setValue(Object.keys(images)[defaultValue], true);

    var controlPanel =
        ui.Panel({widgets: [label, select, ], style: {width: '220px',position: 'top-left'}});
    mapToChange.add(controlPanel);
  }



//create the first panel legend
exports.createLegend=function(colorizedVis,colorizedVis1) {
    var legend = ui.Panel({ style: {width: '220px', position: 'bottom-left' }})

   //legend lable
    var heightLab =  ui.Label({value:'Calibration/Validation/Prediction map',
      style: {fontWeight: 'bold', fontSize: '15px', margin: '10px 5px'}
    });
    legend.add(heightLab);

    // create text on top of legend
    var min = colorizedVis.min;
    var max = colorizedVis.max
    var lon = ee.Image.pixelLonLat().select('longitude');
    var gradient = lon.multiply((colorizedVis.max-colorizedVis.min)/100.0).add(colorizedVis.min);
    var legendImage = gradient.visualize(colorizedVis);

    var thumb = ui.Thumbnail({image: legendImage,params: {bbox:'0,0,100,10', dimensions:'200x10'},
      style: {position: 'bottom-center'}
    });

    var panel2 = ui.Panel({widgets: [ui.Label('0'), ui.Label({style: {stretch: 'horizontal'}}),
      ui.Label('1')],layout: ui.Panel.Layout.flow('horizontal'),
      style: {stretch: 'horizontal', maxWidth: '270px', padding: '0px 0px 0px 8px'}
    });

    legend.add(panel2).add(thumb);

    // Set position of panel
    var extentLegend = ui.Panel({
      style: {position: 'bottom-left',padding: '8px 15px' }
    });

    //Add checkbox widgets and legends
    var extLabel2 = ui.Label({value:'Confusion map', style: {fontWeight: 'bold', fontSize: '15px',
      margin: '10px 5px'}
    });

    // The following creates and styles 1 row of the legend.
    var makeRowa = function(color, name) {
      var colorBox = ui.Label({style: {backgroundColor: '#' + color,padding: '8px', margin: '0 0 4px 0' }});
      // Create a label with the description text.
      var description = ui.Label({value: name,style: {margin: '0 0 4px 6px'}});
     // Return the panel
      return ui.Panel({widgets: [colorBox, description],layout: ui.Panel.Layout.Flow('horizontal')});
    };

    // Name and color for each legend value
    var namesa = ['True Positive','False Negative','True Negative','False Positive'];
    var paletteMAPa = ['D10E00','DF564D','DBEADD','006B0B'];

    // Add color and names to legend
    //for (var i = 0; i < 4; i++) {
    //  extentLegend.add(makeRowa(paletteMAPa[i], namesa[i]));
    //}
    extentLegend.add(makeRowa(paletteMAPa[0], namesa[0]));
    extentLegend.add(makeRowa(paletteMAPa[1], namesa[1]));
    extentLegend.add(makeRowa(paletteMAPa[2], namesa[2]));
    extentLegend.add(makeRowa(paletteMAPa[3], namesa[3]));

    legend.add(extLabel2);
    legend.add(extentLegend);

    return legend
  }

  //////////////////////////////
exports.createnumbers =  function(trainAccuracy,chartROC,ROC_best,AUC) {
  var panel = ui.Panel({style: {width: '280px',position: 'bottom-right'}})//,maxHeight:'200px'
    .add(ui.Label({value:'Resubstitution error matrix: '+trainAccuracy.getInfo(),style: {fontSize: '10px'}}))
    .add(ui.Label({value:'Training overall accuracy: '+trainAccuracy.accuracy().getInfo(),style: {fontSize: '10px'}}))
    .add(ui.Label({value:'Area under curve: '+AUC.getInfo(),style: {fontSize: '10px'}}))
    .add(ui.Label({value:'Best ROC point cutoff: '+ROC_best.getInfo(),style: {fontSize: '10px'}}));

  // Add the panel to the ui.root.
  //panel.widgets().set(4, chartROC)
  var panel1=ui.Panel(chartROC)
  panel.add(panel1)
  //var panel2=ui.Panel(chartROC)
  //panel.add(panel2)
  return panel

  }

  //create the first panel legend
exports.createview = function() {
    var legend = ui.Panel({ style: {height: '70px',width: '220px', position: 'top-left' }})

    // Create legend title
    var legendTitle = ui.Label({value: 'View',style: {fontWeight: 'bold',
      fontSize: '13px', margin: '0 0 4px 0',padding: '0'}});
      legend.add(legendTitle);

    /*var extCheck = ui.Checkbox('Split Panel').setValue(true); //false = unchecked

    //Show/Unshow Split Panel checking action
    extCheck.onChange(function(checked){
         if (checked) {
        ui.root.widgets().reset([splitPanel]);
      } else {
        ui.root.widgets().reset([rightMap]);
      }
    });

    legend.add(extCheck);*/

    return legend
  }
