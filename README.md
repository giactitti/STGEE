# STGEE

Susceptibility Tool for Google Earth Engine (STGEE) is a tool for spatial susceptibility analysis. It allows to calibrate, cross-validate and predict susceptiblity of a selected study area using Random Forest model. More details about the application can be found in the article: [link to the pre-print](https://eartharxiv.org/repository/view/3173/).

## Run/Edit application

From [here](https://giacomotitti.users.earthengine.app/view/stgee) you can run our application. See the source code from [here](https://code.earthengine.google.com/b76fb3cea835fadbe2482a49919aedd8)

## How to use

The STGEE requires two vector data: the map units layer (in the application we used slope units) of the study area and the map units layer of the area where the susceptibility should be predicted.

Both tables shlould contain the column of the dependent variable (0/1) and the columns of the independent variables. Our application use the table of the variables generated with the [SRT tool](https://github.com/giactitti/SRT).

SRT is a collector and spatial reducer of data from GEE available dataset. It allows you to calculate the spatial mean and standard deviation from several online available dataset inside each feature of a feature collection.

![image](https://user-images.githubusercontent.com/59020464/163784560-40c9adb7-ccc2-45c6-bd7b-0ec662b817e4.png)

![image](https://user-images.githubusercontent.com/59020464/163784965-3cff0b6d-0b0a-46f2-9e3f-7e3a95a39bca.png)

## Contacts

The STGEE has been authored by Giacomo Titti, Gabriele Nicola Napoli and Luigi Lombardo

For any request, comment and suggestion, please write to me: giacomotitti@gmail.com

## Cite

Please cite us:

Titti, G., Nicola Napoli, G., Lombardo, L.. (2022). giactitti/STGEE: STGEE v1.1 (v1.1). Zenodo. https://doi.org/10.5281/zenodo.6471966
