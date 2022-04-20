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

exports.quality = function(field, layer, target){

  //----------------------------------------------
  /**
   * Receiver Operating Characteristic (ROC) curve for binary classification
   * source: https://groups.google.com/d/msg/google-earth-engine-developers/52ASlA15yLg/E3exyfyTGQAJ
   * modified from original code by Guy Ziv
  **/
  
  var roc=function(field,layer,target){
    var ROC_field = field, ROC_min = 0, ROC_max = 1, ROC_steps = 50, ROC_points = layer; 
    var target_roc = ROC_points.filter(ee.Filter.eq(target,1));
    var non_target_roc = ROC_points.filter(ee.Filter.eq(target,0));
    
    var ROC = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
      var TPR = ee.Number(target_roc.filter(ee.Filter.gte(ROC_field,cutoff)).size()).divide(target_roc.size());
      
      return ee.Feature(null,{cutoff: cutoff, TPR: TPR});
    }));
    
    var ROC1 = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
      var TNR = ee.Number(non_target_roc.filter(ee.Filter.lt(ROC_field,cutoff)).size()).divide(non_target_roc.size());
      return ee.Feature(null,{cutoff: cutoff, FPR:TNR.subtract(1).multiply(-1),TNR:TNR,
      });
      
    }));
    
    var merge = ROC.map(function(feat){
      var feature= ROC1.filter(ee.Filter.eq("cutoff", feat.get("cutoff"))).first();
      return ee.Feature(null,{TPR: ee.Number(feat.get('TPR')),
      FPR: ee.Number(feature.get('FPR')),
      TNR: ee.Number(feature.get('TNR')),
      cutoff: ee.Number(feature.get('cutoff')),
      dist:ee.Number(feat.get('TPR')).subtract(1).pow(2).add(ee.Number(feature.get('TNR')).subtract(1).pow(2)).sqrt()
      });
    });//,
    
  
    var X = ee.Array(merge.aggregate_array('FPR'));
    var Y = ee.Array(merge.aggregate_array('TPR')); 
    var Xk_m_Xkm1 = X.slice(0,1).subtract(X.slice(0,0,-1));
    var Yk_p_Ykm1 = Y.slice(0,1).add(Y.slice(0,0,-1));
    var AUC = Xk_m_Xkm1.multiply(Yk_p_Ykm1).multiply(0.5).reduce('sum',[0]).abs().toList().get(0)
    // Plot the ROC curve
    var chartROC=(ui.Chart.feature.byFeature(merge, 'FPR', 'TPR').setOptions({
          title: 'ROC curve',
          legend: 'none',
          hAxis: { title: 'False-positive-rate'},
          vAxis: { title: 'True-negative-rate'},
          lineWidth: 1}));
    // find the cutoff value whose ROC point is closest to (0,1) (= "perfect classification")      
    var ROC_best = merge.sort('dist').first().get('cutoff')//.aside(print,'best ROC point cutoff');
    return {'ROC_best':ROC_best,'chartROC':chartROC,'AUC':AUC};
  };
  //-----------------------------------------------------
  
  return roc(field, layer, target);
}
  
  
//-------------------------------------------------------------
exports.binary = function(field, layer, target,ROC_best){
  var ROC_field = field, ROC_points = layer, target=target;
  var cutoff=ROC_best;
  var target_roc = ROC_points.filter(ee.Filter.eq(target,1));
  var TP = target_roc.filter(ee.Filter.gte(ROC_field,cutoff));
  var TP = TP.map(function(ft){return ee.Feature(ft).set('tptf', 0)})
  var FN = target_roc.filter(ee.Filter.lt(ROC_field,cutoff));
  var FN = FN.map(function(ft){return ee.Feature(ft).set('tptf', 1)})

  var non_target_roc = ROC_points.filter(ee.Filter.eq(target,0));
  var TN = non_target_roc.filter(ee.Filter.lt(ROC_field,cutoff));
  var TN = TN.map(function(ft){return ee.Feature(ft).set('tptf', 2)})
  var FP = non_target_roc.filter(ee.Filter.gte(ROC_field,cutoff));
  var FP = FP.map(function(ft){return ee.Feature(ft).set('tptf', 3)})
  return ee.FeatureCollection([TP,FP,TN,FN]).flatten()
}
