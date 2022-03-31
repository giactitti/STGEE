var gridcoll=ee.FeatureCollection('projects/ee-stgee/assets/gridcoll_05-02-2022');
var prediction = ee.FeatureCollection('projects/ee-stgee/assets//gridcoll_secwater_modified_08-02-2022');
//--------------------------------------------------
//Explanatory
var ClassProperty = 'bool_str';

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

var trainAccuracy = gridcoll_classifier.confusionMatrix();

//-------------------------------------------------
//Prediction
var suscPred = prediction.classify(gridcoll2,'gridcoll_classifier');

var suscPredImage = suscPred.reduceToImage({
properties: ['gridcoll_classifier'],
reducer: ee.Reducer.first()
});

//-------------------------------------------------
//spatial cross-validation
var SCV = require('users/gabrielenicolanapoli/Gully:SCV');
var CV = SCV.SCV(gridcoll,['S_mean', 'S_std','Prec_mean','Prec_std','NDVI_mean','NDVI_std'
  ,'NDWI_mean','NDWI_std','HCv_mean','HCv_std','VCv_mean','VCv_std'],2500)
var gridScv=CV['cov']
var suscValidC=CV['susc']

var suscValid = ee.FeatureCollection(suscValidC)

//---------------------------------------------
//ROC of SCV
var suscValidImage = suscValid.reduceToImage({
properties: ['gridcoll_classifier'],
reducer: ee.Reducer.first()
});

//------------------------------------------------

var numbers=function(layer){
  var ROC = require('users/gabrielenicolanapoli/Gully:ROCold');
  var ROCobject = ROC.quality('gridcoll_classifier',layer,'lsd_bool');
  
  var chartROC = ROCobject['chartROC']
  //print(chartROC)
  var ROC_best=ROCobject['ROC_best']
  print(ROC_best)
  var AUC=ROCobject['AUC']
  print(AUC)
  
  var truefalse = ROC.binary('gridcoll_classifier',layer,'lsd_bool', ROC_best);
  
  var tptf = truefalse.reduceToImage({
  properties: ['tptf'],
  reducer: ee.Reducer.first()
  });
  return {'chartROC':chartROC,'ROC_best':ROC_best,'AUC':AUC,'tptf':tptf}
  return ROCobject
}

//-------------------------------------------------
var show=function(){
var DY = require('users/gabrielenicolanapoli/Gully:display_5');

var images={'Calibration map':suscFitImage,
  'Validation map':suscValidImage,
  //'TrueFalse': tptf,
  'Prediction map': suscPredImage
}

var splitPanel=view(images,trainAccuracy,gridScv,suscValid,suscFit)

}


//--------------------------------------------
var view=function(images,trainAccuracy,gridScv,suscValid,suscFit){
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
  
  var button1 = ui.Button({style:{position: 'bottom-right'},label: 'Run Validation  ROC-analysis',onClick: function() {
    var num=numbers(suscValid);
    rightMap.add(DY.createnumbers(trainAccuracy,num['chartROC'],num['ROC_best'],num['AUC']));
    rightMap.addLayer(num['tptf'],colorizedVis1,'Confusion map')
  }});
  
  var button2 = ui.Button({style:{position: 'bottom-right'},label: 'Run Calibration ROC-analysis',onClick: function() {
    var num=numbers(suscFit);
    rightMap.add(DY.createnumbers(trainAccuracy,num['chartROC'],num['ROC_best'],num['AUC']));
  }});

  rightMap.add(button1)
  rightMap.add(button2)
  
  //rightMap.add(createview())
  rightMap.add(DY.createLegend(colorizedVis,colorizedVis1))
  rightMap.setControlVisibility(true);
  rightMap.addLayer(images['Calibration map'],colorizedVis,'Calibration map')
  rightMap.addLayer(images['Validation map'],colorizedVis,'Validation map')
  rightMap.addLayer(images['Prediction map'],colorizedVis,'Prediciton map')
  rightMap.addLayer(gridScv,{},'Spatial CV grid')
  
  var linker = ui.Map.Linker([rightMap,leftMap]);
  
  var splitPanel = ui.SplitPanel({
    firstPanel: leftMap,
    secondPanel: rightMap,
    orientation: 'horizontal',
    wipe: true,
  });
  
  ui.root.widgets().reset([splitPanel]);  
  leftMap.setCenter(13.1, 37.72604, 12);
  
}


//-------------------------------------------------

Map.addLayer(gridcoll,{},'Study area')
Map.addLayer(prediction,{},'Prediction area')

Map.setCenter(13.1, 37.72604, 12);
  
var button = ui.Button({
  label: 'Run analysis',
  onClick: function() {
    show();
  }
});

Map.add(button)

//-------------------------------------------------
//show()
