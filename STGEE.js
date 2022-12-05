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

// INPUT
//--------------------------------------------------------------------------------------------
// vector file with column predictors and binomial event column
var predictors_shp = 'projects/stgee-dataset/assets/DataDemo';
// name of the binomial event column
var binomial_event = 'lsd';
// predictors column name
var predictors_column_name = ['Rlf_mean','Slope_mean','VCv_mean','HCv_mean','NDVI_mean','litho_0','litho_1','litho_2'];
// vector file with column predictors of the prediction area (transferability)
var prediction_area_shp = 'projects/stgee-dataset/assets/DataDemoPrediction';
// scale of the spatial grid for the spatial cross-validation
var scale_spatial_grid = 30000
// fid, feature id column name (it must be integer)
var fid = 'fid'

// RUN function
//---------------------------------------------------------------------------------------------
var RUN=require('users/giacomotitti/STGEE_dev:run');
RUN.runner(predictors_shp,binomial_event,predictors_column_name,prediction_area_shp,scale_spatial_grid,fid);
