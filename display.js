/*
***************************************************************************
    STGEE
        begin                : 2022-04
        copyright            : (C) 2022 by Giacomo Titti and Gabriele Nicola Napoli,
                               Bologna, April 2022
        email                : giacomotitti@gmail.com
***************************************************************************

***************************************************************************
    STGEE
    Copyright (C) 2022 by Giacomo Titti and Gabriele Nicola Napoli, Bologna, April 2022

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 ***************************************************************************
*/
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
  var namesa = ['False Positive','True Negative','False Negative','True Positive'];
  var paletteMAPa = ['D10E00','DF564D','DBEADD','006B0B'];

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

// Create a button to hide the panel.
var button3 = ui.Button({
  style:{position: 'top-center',stretch:'horizontal'},
  label: 'Close',
});

 // Hide variables
var hideVariables = function() {
panel.style().set({
  shown: false
});
return;
};

//Register the function to the button click event.
button3.onClick(hideVariables);

var panel = ui.Panel({style: {width: '280px',position: 'bottom-right',maxHeight:'15em'}})//,maxHeight:'200px'
  .add(ui.Label({value:'Resubstitution error matrix: '+trainAccuracy.getInfo(),style: {fontSize: '10px'}}))
  .add(ui.Label({value:'Training overall accuracy: '+trainAccuracy.accuracy().getInfo(),style: {fontSize: '10px'}}))
  .add(ui.Label({value:'Area under curve: '+AUC.getInfo(),style: {fontSize: '10px'}}))
  .add(ui.Label({value:'Best ROC point cutoff: '+ROC_best.getInfo(),style: {fontSize: '10px'}}));

var panel1=ui.Panel(chartROC)
panel.add(panel1)
.add(button3);
return panel
  
}
  
//create the first panel legend
exports.createview = function() {
  var legend = ui.Panel({ style: {height: '70px',width: '220px', position: 'top-left' }})
  
  // Create legend title
  var legendTitle = ui.Label({value: 'View',style: {fontWeight: 'bold',
    fontSize: '13px', margin: '0 0 4px 0',padding: '0'}});
    legend.add(legendTitle);

  return legend
}