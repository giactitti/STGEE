exports.quality = function(field, layer, target){

  //----------------------------------------------
  /**
   * Receiver Operating Characteristic (ROC) curve for binary classification
   * source: https://groups.google.com/d/msg/google-earth-engine-developers/52ASlA15yLg/E3exyfyTGQAJ
   * modified from original code by Guy Ziv
  **/

  var roc=function(field,layer,target){
    //print(layer)
    var ROC_field = field, ROC_min = 0, ROC_max = 1, ROC_steps = 50, ROC_points = layer;
    var target_roc = ROC_points.filter(ee.Filter.eq(target,1));
    var non_target_roc = ROC_points.filter(ee.Filter.eq(target,0));

    var ROC = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
      var TPR = ee.Number(target_roc.filter(ee.Filter.gte(ROC_field,cutoff)).size()).divide(target_roc.size());

      return ee.Feature(ee.Geometry.Point(-62.54, -27.32),{cutoff: cutoff, TPR: TPR});
    }));

    var ROC1 = ee.FeatureCollection(ee.List.sequence(ROC_min, ROC_max, null, ROC_steps).map(function (cutoff) {
      var TNR = ee.Number(non_target_roc.filter(ee.Filter.lt(ROC_field,cutoff)).size()).divide(non_target_roc.size());
      return ee.Feature(ee.Geometry.Point(-62.54, -27.32),{cutoff: cutoff, FPR:TNR.subtract(1).multiply(-1),TNR:TNR,
      });

    }));

    //print(ROC1.select('cutoff'),'ROC1')
    //print(ROC,'ROC')
    //print(ROC.get("cutoff"),'ROC')
    //print(ROC1.filter(ee.Filter.eq("cutoff", ROC.select("cutoff"))))

    var merge = ROC.map(function(feat){
      //var feature= ee.Feature(ROC1.filter(ee.Filter.eq("system:index", feat.id())))
      var feature= ROC1.filter(ee.Filter.eq("cutoff", feat.get("cutoff"))).first();
      return ee.Feature(null,{TPR: ee.Number(feat.get('TPR')),
      FPR: ee.Number(feature.get('FPR')),
      TNR: ee.Number(feature.get('TNR')),
      cutoff: ee.Number(feature.get('cutoff')),
      dist:ee.Number(feat.get('TPR')).subtract(1).pow(2).add(ee.Number(feature.get('TNR')).subtract(1).pow(2)).sqrt()
      });
    });//,


    /*

    // Use trapezoidal approximation for area under curve (AUC)
    //print(merge,'merge')
    //print(ROC1.merge(ROC));
    var X = ee.List(ROC1.aggregate_array('FPR'));//.toList();
    //print(X,'x')
    var Y = ROC.aggregate_array('TPR');
    var Z = ROC1.aggregate_array('TNR');
    var cut = ROC.aggregate_array('cutoff');
    //print(Y,'y')
    var Xk_m_Xkm1 = ee.Array(X).slice(0,1).subtract(ee.Array(X).slice(0,0,-1));
    var Yk_p_Ykm1 = ee.Array(Y).slice(0,1).add(ee.Array(Y).slice(0,0,-1));
    var AUC = Xk_m_Xkm1.multiply(Yk_p_Ykm1).multiply(0.5).reduce('sum',[0]).abs().toList().get(0);





    //print(AUC,'Area under curve')
    //var ROC3 = ROC.map(function (ROC1) {
    //  return ee.Feature(null,{cutoff: cutoff, FPR:TNR.subtract(1).multiply(-1)})
    //}
    var ROC3 = ROC.map(function() {
      return ee.Feature(null,{FPR:ROC.get('FPR')})
    });
    print(ROC3)


    // Plot the ROC curve
    var chartROC = (ui.Chart.array.values({array: Y, axis: 0, xLabels: X}).setOptions({

    //var chartROC=(ui.Chart.feature.byFeature(ROC3, 'FPR', 'TPR').setOptions({
          title: 'ROC curve',
          legend: 'none',
          hAxis: { title: 'False-positive-rate'},
          vAxis: { title: 'True-negative-rate'},
          lineWidth: 1}));
    // find the cutoff value whose ROC point is closest to (0,1) (= "perfect classification")
    print(chartROC);



    var dist=ee.Array(Y).subtract(1).pow(2)
    .add(ee.Array(Z).subtract(1).pow(2)).sqrt();
    print(dist)

    var list = [dist,cut];
    //print(Math.max(ee.Array(list[0])),'list')
    //print(dist.zip(cut))


    var people = ee.List([dist]).map(function (i) {
      return {
          dist: i ,cut: cut}});
    print(people.get(0),'people')
    var people=people.get(0)

    var len=dist.length().get([0])
    //print(len.get([0]))
    lista=[]
    for (var j = 0; j < dist.length; j++){
      print('ciao')
      lista.push({'dist': dist.get([j]), 'cut': cut.get([j])});
    }
    print(lista,'list')
    //var newdist=[]
    //print(newdist);
    //var mindist=[dist].indexOf(dist.sort().get([0]));

    //print(dist.sort().get([0]));
    //print(mindist);
    //print(cut);


    //var ROC_best = cut.get(mindist).aside(print,'best ROC point cutoff');

    //print(dist)


    //var ROC_best = ROC.sort('dist').first().get('cutoff')//.aside(print,'best ROC point cutoff');
    var ROC_best = list.sort(0).first().get(1).aside(print,'best ROC point cutoff');
    return {'ROC_best':ROC_best,'chartROC':chartROC,'AUC':AUC};
  };*/




    var X = ee.Array(merge.aggregate_array('FPR'));
    //print(X,'x')
    var Y = ee.Array(merge.aggregate_array('TPR'));
    var Xk_m_Xkm1 = X.slice(0,1).subtract(X.slice(0,0,-1));
    var Yk_p_Ykm1 = Y.slice(0,1).add(Y.slice(0,0,-1));
    var AUC = Xk_m_Xkm1.multiply(Yk_p_Ykm1).multiply(0.5).reduce('sum',[0]).abs().toList().get(0)
    //print(AUC,'Area under curve')
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

  //----------------------------------------------------

  //Make an image out of the "gridcoll's area" attribute.
  /*var imaged = grid_test.reduceToImage({
  properties: ['gridcoll_classifier'],
  reducer: ee.Reducer.first()
  });

  //Display the county land area image.
  Map.addLayer(imaged, {
    min: 0.0,
    max: 1.0,
    palette: ['FCFDBF', 'FDAE78', 'EE605E', 'B63679', '711F81', '2C105C']
  },'Susceptibility index');*/

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

  //Make an image out of the "gridcoll's area" attribute.

  //Display the county land area image.
  /*Map.addLayer(imaged, {
    min: 0.0,
    max: 3.0,
    palette: ['FCFDBF', 'EE605E', '711F81', '2C105C']
  },'TPFPTNFN');*/


  // Paint the edges with different colors, display.
  /*var empty = ee.Image().byte();
  var fills = empty.paint({
    featureCollection: truefalse,
    color: 'tptf',
  });
  var palette = ['FF0000', '00FF00', '0000FF'];
  Map.addLayer(fills, {palette: palette, min: 0,max: 4}, 'colored fills');*/










//var feat=ee.FeatureCollection({TP: TP, TN: TN, FP:FP, FN:FN})
