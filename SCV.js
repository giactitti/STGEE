//-------------------

//Training the classifer and applying it with the filtered training collection.
var gridcoll_classifier = function(collection,inputProperties){
  var ClassProperty = 'lsd_bool';
  return ee.Classifier.smileRandomForest(20).train({
    features: collection,
    classProperty: ClassProperty,
    inputProperties: inputProperties
  });
};

//spatial cross-validation
exports.SCV = function(gridcoll,inputProperties,scaleGrid){
  //var ROC = require('users/gabrielenicolanapoli/Gully:ROC');...
  //cover grid
  var covgrid = gridcoll.geometry().coveringGrid(gridcoll.geometry().projection(),scaleGrid);
  //Map.addLayer(covgrid,{},'griglia')

  var centroidi =  gridcoll.map(function(feature) {
      return feature.centroid(0.01,gridcoll.geometry().projection())
  });
  //Map.addLayer(centroidi,{},'centroidi')
  //print(centroidi,'cent')

  var susc = covgrid.map(function(feature){
    var id_test = covgrid.filter(ee.Filter.eq("system:index", feature.id()))
    var id_train = covgrid.filter(ee.Filter.neq("system:index", feature.id()));

    var griglia = centroidi.filterBounds(id_train.geometry());
    var lis_train = griglia.reduceColumns(ee.Reducer.toList(), ['fid']).get('list');

    var sel_train = gridcoll.filter(ee.Filter.inList('fid', lis_train));
    var griglia_test = centroidi.filterBounds(feature.geometry());
    var lis_test = griglia_test.reduceColumns(ee.Reducer.toList(), ['fid']).get('list');
    var sel_test = gridcoll.filter(ee.Filter.inList('fid', lis_test));


    var check_test_one = ee.Number(sel_test.filter(ee.Filter.eq('lsd_bool', 1)).size());
    var check_test_zero = ee.Number(sel_test.filter(ee.Filter.eq('lsd_bool', 0)).size());

    //if ((check_test_one>ee.Number(0) && check_test_zero>ee.Number(0))) {
      var classifier = gridcoll_classifier(sel_train,inputProperties).setOutputMode('PROBABILITY');
      var susc = sel_test.classify(classifier,'gridcoll_classifier');
      //var truefalse = ROC.quality('gridcoll_classifier',susc,'lsd_bool')...
      return susc
    //} else{
    //  return ee.FeatureCollection()
    //}
  });
  return {'susc':susc,'cov':covgrid}
}

//var ROC = require('users/giacomotitti/SRT:ROC');
//var truefalse = ROC.quality('gridcoll_classifier',suscFit,'lsd_bool')
//Map.setCenter(13.014, 37.72604, 10);

/*Map.setCenter(13.014, 37.72604, 12);
var gridcoll=ee.FeatureCollection('projects/ee-gullyerosion/assets/gridcoll_merged_modified');
print(gridcoll)

var suscValid = SCV(gridcoll)
print(suscValid.flatten())
Map.addLayer(suscValid.flatten(),{},'out')*/
