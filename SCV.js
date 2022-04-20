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

  var covgrid = gridcoll.geometry().coveringGrid(gridcoll.geometry().projection(),scaleGrid);
  
  var centroidi =  gridcoll.map(function(feature) {
      return feature.centroid(0.01,gridcoll.geometry().projection())
  });

  print(covgrid,'covgrid')
  var susc = covgrid.map(function(cella){
    var id_test = covgrid.filter(ee.Filter.eq("system:index", cella.id()));
    var id_train = covgrid.filter(ee.Filter.neq("system:index", cella.id()));
  
    //var cella = covgrid.filter(ee.Filter.eq("system:index", '580,1677'))
    //var id_test = covgrid.filter(ee.Filter.eq("system:index", '580,1677'))
    //var id_train = covgrid.filter(ee.Filter.neq("system:index", '580,1677'));
    
    var griglia = centroidi.filterBounds(id_train.geometry());
    var lis_train = griglia.reduceColumns(ee.Reducer.toList(), ['fid']).get('list');
    var sel_train = gridcoll.filter(ee.Filter.inList('fid', lis_train));
    
    //print(sel_train,'sel_train')
    
    var griglia_test = centroidi.filterBounds(cella.geometry());
    var lis_test = griglia_test.reduceColumns(ee.Reducer.toList(), ['fid']).get('list');
    var sel_test = gridcoll.filter(ee.Filter.inList('fid', lis_test));
    
    //var sel_train = covgrid.filter(ee.Filter.eq("system:index", '580,1677'))
    
    var check_test_one = ee.Number(sel_test.filter(ee.Filter.eq('lsd_bool', 1)).size());
    var check_test_zero = ee.Number(sel_test.filter(ee.Filter.eq('lsd_bool', 0)).size());
    //print(check_test_one)
    //print(check_test_zero)
    
    if (check_test_one==ee.Number(0) || check_test_zero==ee.Number(0)) {
      //print('vuoto')
    //Map.addLayer(susc,{},'out')//.filter(ee.Filter.eq("system:index", '580,1677')).flatten(),'ao')
    
    } else{ 
      var classifier = gridcoll_classifier(sel_train,inputProperties).setOutputMode('PROBABILITY');
      var susc = sel_test.classify(classifier,'gridcoll_classifier');
      return susc
    }
    
  });
  
  var idList = ee.List.sequence(0,susc.flatten().size().subtract(1));

  // featureCollection to a List
  var list = susc.flatten().toList(susc.flatten().size());

  // set the system:index
  var assetID = ee.FeatureCollection(idList.map(function(newSysIndex){
    var feat = ee.Feature(list.get(newSysIndex));
    // format number to string (system:index must be a string)
    var indexString = ee.Number(newSysIndex).format('%d')
  return feat.set('system:index', indexString, 'ID', indexString);
}));
  
  
  return {'susc':assetID,'cov':covgrid}
}
