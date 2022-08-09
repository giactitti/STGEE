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

exports.runner = function(predictors_shp,binomial_event,column_names,prediction_area_shp){
  var gridcoll=ee.FeatureCollection(predictors_shp);
  var prediction = ee.FeatureCollection(prediction_area_shp);
  //--------------------------------------------------
  //Explanatory
  var ClassProperty = binomial_event;
  
  //Training the classifer and applying it with the filtered training collection.
  var gridcoll_classifier = ee.Classifier.smileRandomForest(20).train({
    features: gridcoll,
    classProperty: ClassProperty,
    inputProperties: column_names
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
  var SCV = require('users/giacomotitti/STGEE:SCV');
  var CV = SCV.SCV(gridcoll,column_names,2500)
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
    var ROC = require('users/giacomotitti/STGEE:ROC');
    var ROCobject = ROC.quality('gridcoll_classifier',layer,'lsd_bool');
    
    var chartROC = ROCobject['chartROC']
    //print(chartROC)
    var ROC_best=ROCobject['ROC_best']
    var AUC=ROCobject['AUC']
    
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
  var DY = require('users/giacomotitti/STGEE:display');
  
  var images={'Calibration map':suscFitImage,
    'Validation map':suscValidImage,
    //'TrueFalse': tptf,
    'Prediction map': suscPredImage
  }
  
  var splitPanel=view(images,trainAccuracy,gridScv,suscValid,suscFit)
  
  }
  
  
  //--------------------------------------------
  var view=function(images,trainAccuracy,gridScv,suscValid,suscFit){
    var DY = require('users/giacomotitti/STGEE:display');
    
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
    
    var button1 = ui.Button({style:{position: 'bottom-right', width: '135px', padding: '2px', margin: '3px'},label: 'Run Validation',onClick: function() {
      var num=numbers(suscValid);
      rightMap.add(DY.createnumbers(trainAccuracy,num['chartROC'],num['ROC_best'],num['AUC']));
      rightMap.addLayer(num['tptf'],colorizedVis1,'Confusion map of Validation')
    }});
    
    var button2 = ui.Button({style:{position: 'bottom-right', width: '135px', padding: '2px', margin: '3px'},label: 'Run Calibration',onClick: function() {
      var num=numbers(suscFit);
      rightMap.add(DY.createnumbers(trainAccuracy,num['chartROC'],num['ROC_best'],num['AUC']));
      rightMap.addLayer(num['tptf'],colorizedVis1,'Confusion map of Calibration')
    }});
    
    var panel5 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'),
    style:{ padding: '0px', margin: '0px',
    position: 'bottom-right'}}).add(button1).add(button2)
    
    rightMap.add(panel5)
  
  
    
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
}
