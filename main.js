//Map.setCenter(13.014, 37.72604, 10);
var gridcoll=ee.FeatureCollection('projects/ee-gullyerosion/assets/gridcoll_05-02-2022');
var prediction = ee.FeatureCollection('projects/ee-gullyerosion/assets/gridcoll_secwater_modified_08-02-2022');
//--------------------------------------------------
//Explanatory
var ClassProperty = 'bool_str';

//print(gridcoll)
//print(prediction)

//Training the classifer and applying it with the filtered training collection.
var gridcoll_classifier = ee.Classifier.smileRandomForest(20).train({
  features: gridcoll,
  classProperty: ClassProperty,
  inputProperties: ['S_mean', 'S_std','Prec_mean','Prec_std','NDVI_mean','NDVI_std'
  ,'NDWI_mean','NDWI_std','HCv_mean','HCv_std','VCv_mean','VCv_std']
});

var gridcoll2 = gridcoll_classifier.setOutputMode('PROBABILITY');
var suscFit = gridcoll.classify(gridcoll2,'gridcoll_classifier');

var suscFitImage = suscFit.reduceToImage({
properties: ['gridcoll_classifier'],
reducer: ee.Reducer.first()
});

//Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = gridcoll_classifier.confusionMatrix();
//print('Resubstitution error matrix:', trainAccuracy);
//print('Training overall accuracy:', trainAccuracy.accuracy());

//-------------------------------------------------
//Prediction
var suscPred = prediction.classify(gridcoll2,'gridcoll_classifier');

var suscPredImage = suscPred.reduceToImage({
properties: ['gridcoll_classifier'],
reducer: ee.Reducer.first()
});


//------------------------------------------------

var numbers=function(layer){
  //print(suscFit,'susc')
  var ROC = require('users/gabrielenicolanapoli/Gully:ROCold');
  var ROCobject = ROC.quality('gridcoll_c',layer,'lsd_bool');

  var chartROC = ROCobject['chartROC']
  //print(chartROC)
  var ROC_best=ROCobject['ROC_best']
  //print(ROC_best)
  var AUC=ROCobject['AUC']
  //print(AUC)

  });
  return {'chartROC':chartROC,'ROC_best':ROC_best,'AUC':AUC}
  return ROCobject
}

//------------------------------------------------
//var ROCobject1 = ROC.quality('gridcoll_classifier',suscFit,'lsd_bool');
//var chartROC1 = ROCobject1['chartROC']

//-------------------------------------------------
var show=function(){
var DY = require('users/gabrielenicolanapoli/Gully:display');

var images={'Calibration map':suscFitImage,
  'Prediction map': suscPredImage
}
var splitPanel=view(images,trainAccuracy,suscFit)
}


//--------------------------------------------
var view=function(images,trainAccuracy,suscFit){
  var DY = require('users/gabrielenicolanapoli/Gully:display_5');
  var paletteone = ['d10e00ff', 'df564dff', 'eb958fff', 'f0b2aeff', 'ffffffff',
    'dbeaddff', '4e9956ff', '1b7b25ff', '006b0bff']

  var paletteone1 = ['D10E00','DF564D','DBEADD','006B0B']

  var colorizedVis = {min: 0.0,max: 1.0,palette: paletteone.reverse()};
  var colorizedVis1 = {min: 0.0,max: 3.0,palette: paletteone1.reverse()}

  var leftMap = ui.Map();
  leftMap.add(DY.createLegend(colorizedVis,colorizedVis1))
  leftMap.setControlVisibility(true);
  //leftMap.add(createview())
  var leftSelector = DY.addLayerSelector(leftMap, 0,images,colorizedVis);

  var rightMap = ui.Map();

  var button2 = ui.Button({style:{position: 'bottom-right'},label: 'Run Calibration ROC-analysis',onClick: function() {
    var num=numbers(suscFit);
    rightMap.add(DY.createnumbers(trainAccuracy,num['chartROC'],num['ROC_best'],num['AUC']));
    //rightMap.addLayer(num['tptf'],colorizedVis1,'Confusion map')
  }});

  rightMap.add(button2)

  //rightMap.add(createview())
  rightMap.add(DY.createLegend(colorizedVis,colorizedVis1))
  rightMap.setControlVisibility(true);
  rightMap.addLayer(images['Calibration map'],colorizedVis,'Calibration map')
  
  //rightMap.addLayer(images['TrueFalse'],colorizedVis1,'TrueFalse')
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

  leftMap.setCenter(13.1, 37.72604, 12);

}


//-------------------------------------------------

Map.addLayer(gridcoll,{},'Study area')
Map.addLayer(prediction,{},'Prediction area')
//Map.addLayer(gridScv,{},'Spatial CV grid')

//ui.root.widgets.add([simpleMap]);

Map.setCenter(13.1, 37.72604, 12);

var button = ui.Button({
  label: 'Run analysis',
  onClick: function() {
    //ui.root.clear();
    show();
  }
});

Map.add(button)

//-------------------------------------------------
//show()
