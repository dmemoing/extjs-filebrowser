/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('FileBrowser.Application', {
    extend: 'Ext.app.Application',
    
    name: 'FileBrowser',

    stores: [
        // TODO: add global / shared stores here
    ],
    
	views: [
        'FileBrowser.FileBrowser.FileBrowser'
    ],
    launch: function () {

        Ext.create({
            xtype: 'window',
            closable: false,
            autoShow: true,
            height: 500,
            width: 800,
            layout: 'fit',
            items: [{
                xtype: 'filebrowser',
                address: {
                    urlGet: serverAddress+'fss/directory',
                    urlNewFile: serverAddress+'fss/file',
                    urlNewDirectory: serverAddress+'fss/directory',
                    urlRename: serverAddress+'fss/directory',
                    urlDelete: serverAddress+'fss/directory',
                    urlCpmv: serverAddress+'fss/cpmv',
                    urlSave: serverAddress+'fss/file'
                }
            }]
        });

    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
