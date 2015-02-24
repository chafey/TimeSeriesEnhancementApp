scanDICOMFiles = function(fileList) {

    var deferred = $.Deferred();

    var deferreds = [];

    var patients = [];
    var patientMap = {};
    var studies = [];
    var studyMap = {};

    $.each(fileList, function(index, file) {
        updateProgress(index + 1, fileList.length);
        // skip files we know are not DICOM P10
        if(/DS_STORE$|DICOMDIR$|exe$|dll$/i.test(file.name) === true) {
            return;
        }

        var readDeferred = $.Deferred();
        deferreds.push(readDeferred);
        readAndParseDICOMFile(file).then(function(dataSet) {
            // extract studies, series and images
            var studyInstanceUID =  dataSet.string('x0020000d');
            var study = studyMap[studyInstanceUID];
            if(study === undefined) {

                var patientKey = dataSet.string('x00100020');
                var patient = patientMap[patientKey]
                if(patient === undefined) {
                    patient = {
                        patientName: dataSet.string('x00100010'),
                        patientID: dataSet.string('x00100020'),
                        patientBirthDate: dataSet.string('x00100030'),
                        patientSex: dataSet.string('x00100040'),
                        checked: "checked",
                        studies: []
                    };
                    patientMap[patientKey] = patient;
                    patients.push(patient);
                }

                study = {
                    patientName: dataSet.string('x00100010'),
                    patientID: dataSet.string('x00100020'),
                    studyInstanceUID: studyInstanceUID,
                    studyDescription : dataSet.string('x00081030'),
                    studyDate : dataSet.string('x00080020'),
                    accessionNumber : dataSet.string('x00080050'),
                    foundInstances : 1,
                    totalInstances : 1,
                    size: file.size,
                    errors: [],
                    fileIndexes: [index],
                    fileManagerFileIndexes: [],
                    checked: "checked"
                };
                patient.studies.push(study);
                studyMap[studyInstanceUID] = study;
                studies.push(study);
            } else {
                study.fileIndexes.push(index);
                study.foundInstances++;
                study.totalInstances++;
                study.size += file.size;
            }

            /*var data = {
             patientName: dataSet.string('x00100010'),
             patientID: dataSet.string('x00100020'),
             patientBirthDate: dataSet.string('x00100030'),
             patientSex: dataSet.string('x00100040'),
             studyDate : dataSet.string('x00080020'),
             studyTime : dataSet.string('x00080030'),
             accessionNumber : dataSet.string('x00080050'),
             studyDescription : dataSet.string('x00081030'),
             studyInstanceUID : dataSet.string('x0020000d'),
             studyID : dataSet.string('x00200010'),
             seriesDate : dataSet.string('x00080021'),
             seriesTime : dataSet.string('x00080031'),
             modality : dataSet.string('x00080060'),
             seriesDescription : dataSet.string('x0008103e'),
             seriesInstanceUID : dataSet.string('x0020000e'),
             sopInstanceUid :dataSet.string('x00080018')
             };
             */
            //console.log('done');
            readDeferred.resolve();
        }, function() {
            //console.log('fail');
            readDeferred.resolve();
        });
    });

    $.when.apply($, deferreds).then(function() {
        deferred.resolve(patients);
    });
    return deferred;
};