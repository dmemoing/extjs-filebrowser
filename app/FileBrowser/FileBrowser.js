/*!
 * Ext JS Library
 * Copyright(c) 2006-2014 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('FileBrowser.FileBrowser.FileBrowser',{
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.ux.TabReorderer'
    ],
    xtype: 'filebrowser',
    layout: 'border',
    items: [{
        region: 'west', 
        xtype: 'treePanel'
    },{
        region: 'center',
        xtype: 'tabpanel',
        autoWidth: true,
        autoHeight: true,
        border: true,
        plugins: 'tabreorderer',
        items:[{
            title: 'files',
            layout: 'fit',
            id: 'tab-files',
            saved: true,
            reorderable: false,
            items:{
                xtype: 'files',
                layout: 'fit'
            }
        }],
        listeners: {
            beforetabchange: function(tabPanel, newCard, oldCard, eOpts){
                if(oldCard == null){
                    return true;
                }
                if(oldCard.saved == false){
                    Ext.Msg.confirm('Save', 'Save changes?', function (button) {
                        oldCard.saved = true;
                        var btn = oldCard.down('button[text=save]');
                        btn.disable();
                        if (button == 'yes') {
                            btn.fireEvent('click',btn);
                        //    tabPanel.setActiveTab(newCard);
                        } else {
                        //    tabPanel.setActiveTab(newCard);
                        }
                        tabPanel.setActiveTab(newCard);
                    });
                    return false;
                }
            }
        }
    }],

    initComponent: function(){
        this.items[0].address = this.address;
        this.items[1].items[0].items.address = this.address;
        this.callParent(arguments);

        this.down('treePanel').on('itemclick',this.onItemclick);
        var tabs = this.down('tabpanel');
        var tabId = 'tab-files';
        var tab = tabs.getComponent(tabId);
    //    tab.down('dataview').getStore().load();
        tab.down('dataview').on('itemdblclick',this.onItemclick);
    },

    loadFile: function(address) {
        var deferred = new Ext.Deferred(); // create the Ext.Deferred object

        Ext.Ajax.request({
            url: serverAddress+'fss/file?cmd=view&path='+address,
            method: 'GET',
            headers: {
                Authorization: token
            },
            success: function (response, options) {
                deferred.resolve(response);
            },
            failure: function (response, options) {
            }
        });

        return deferred.promise;  // return the Promise to the caller
    },

    languageName: function(filename){
        if(filename.match(/\.js/)){
            return "javascript";
        }else if(filename.match(/\.cpp/)){
            return "text/x-c++src";
        }else if(filename.match(/\.css/)){
            return "text/css";
        }else if(filename.match(/\.c/)){
            return "text/x-csrc";
        }else if(filename.match(/\.java/)){
            return "text/x-java";
        }else if(filename.match(/\.html/)){
            return "htmlmixed";
        }
    },

    onItemclick: function(view, selectedItem){
        var urlSave = this.up('filebrowser').address.urlSave;
        var tabs = this.up('filebrowser').down('tabpanel');
        
        if(!selectedItem.data.leaf){
            var tabId = 'tab-files';
            var tab = tabs.getComponent(tabId);
            var store = tab.down('dataview').getStore();
            store.removeAll();
            store.load({params:{cmd: 'get', path: selectedItem.data.path}});
            tab.down('textfield').setValue(selectedItem.data.path);
        }else{
            var tabId = 'tab-'+selectedItem.data.path;
        //    alert(selectedItem.data.id);
            tabId = tabId.replace(/[ \/\.]/g,'');
            var tab = tabs.getComponent(tabId);
            if(!tab){
                var vartext = this.up('filebrowser').loadFile(selectedItem.data.path);
                var language = this.up('filebrowser').languageName(selectedItem.data.text);
                var codearea = Ext.create({
                    xtype: 'codeArea',
                    id: tabId,
                    urlSave: urlSave,
                    address: selectedItem.data.path,
                    saved: true,
                    title: selectedItem.data.text,
                    closable: true, 
                //    icon:'resources/icons/application_view_list.png',
                    autoWidth: true,
                    autoHeight: true,
                    autoScroll: true,
                    active: true,//为了兼容IE9
                    layout: 'fit',
                    listeners:{
                        beforeclose: function(panel, eOpts){
                           if(panel.saved == false){
                                Ext.Msg.confirm('Save', 'Save changes?', function (button) {
                                    panel.saved = true;
                                    var btn = panel.down('button[text=save]');
                                    btn.disable();
                                    if (button == 'yes') {
                                        btn.fireEvent('click',btn);
                                    //    tabPanel.setActiveTab(newCard);
                                    } else {
                                    //    tabPanel.setActiveTab(newCard);
                                    }
                                    panel.destroy();
                                });
                                return false;
                            } 
                        }
                    }
                });
                vartext.then(function(response){
                    codearea.setValue(response.responseText);
                    tab = tabs.add(codearea);
                    tabs.setActiveTab(tab);
                    if(language != null){
                        codearea.setMode(language);
                    }
                });
            }
        }
        tabs.setActiveTab(tab);
    }
});