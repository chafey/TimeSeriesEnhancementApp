function readAndParseDICOMFileLength(file, maxLength) {
    var deferred = $.Deferred();

    var reader = new FileReader();

    function parse(e) {
        var byteArray = new Uint8Array(e.target.result);
        try {
            var dataSet = dicomParser.parseDicom(byteArray);
            deferred.resolve(dataSet);
        }
        catch(err) {
            if(err.dataSet) {
                if(Object.keys(err.dataSet.elements).length > 0) {
                    deferred.resolve(err.dataSet);
                    return;
                }
            }
            deferred.reject(err);
        }
    }

    reader.onloadend = parse;
    reader.onerror = function(e) {
        deferred.reject(e);
    };

    var fileOrSlice = maxLength ? file.slice(0, maxLength) : file;
    reader.readAsArrayBuffer(fileOrSlice);

    return deferred;
}


readAndParseDICOMFile = function(file, maxTag)
{
    var deferred = $.Deferred();

    var maxLength = maxTag ? 20000 : undefined;

    var readDeferred = readAndParseDICOMFileLength(file, maxLength);
    readDeferred.done(function(dataSet) {
        deferred.resolve(dataSet);
    }).fail(function(err) {
        deferred.resolve();
    });


    return deferred;
};