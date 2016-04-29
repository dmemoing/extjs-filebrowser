Ext.define('FileBrowser.FileBrowser.TreePanel', {
    extend: 'Ext.tree.Panel',

    requires: [
        'Ext.tree.*',
        'Ext.data.*'
    ],
    xtype: 'treePanel',
    controller: 'treeController',

    height: 500,
    width: 200,
    title: 'Files',
    tools:[{
        type: 'refresh',
        handler: 'onrefresh'
    }],
    useArrows: true,
    border: true,
    resizable: true, 

    initComponent: function() {
        var address = this.address;
        Ext.apply(this, {
            store: Ext.create('Ext.data.TreeStore',{
                proxy: {
                    type: 'ajax',
                    actionMethods: {
                        read: 'GET'
                    },              
                    url: address.urlGet,
                    headers: {
                        Authorization: token
                    },
                    reader: {
                        type: 'json'
                    },
                    extraParams:{
                        cmd: 'get',
                        path: 'localfolder'
                    },
                    writer: {
                        type: 'json'
                    }
                },
                root: {
                    text: 'localfolder',
                    path: 'localfolder',
                    expanded: true
                },
                folderSort: true
            }),

            tbar: [{
                text: 'Expand All',
                scope: this,
                handler: this.onExpandAllClick
            }, {
                text: 'Collapse All',
                scope: this,
                handler: this.onCollapseAllClick
            }],

            viewConfig: {
                plugins: {
                    ptype: 'treeviewdragdrop'
                },
                listeners: {
                    drop: function(node, data, overModel, dropPosition, eOpts){
                        var src = data.records[0].data.path;
                        var dst = overModel.data.path;
                        Ext.Ajax.request({
                            url: address.urlCpmv,
                            method: 'PUT',
                            params: {cmd: 'move', src: src, dst: dst},
                            headers: {
                                Authorization: token
                            },
                            success: function (response, options) {
                            //    var res = Ext.decode(response.responseText);
                            //    alert(res.log);
                            },
                            failure: function (response, options) {
                                alert('fail');
                            }
                        });
                    }
                }
            }
        });
        var me = this;
        me.foldermenu = new Ext.menu.Menu({
            items: [{
                text: 'newfile',
                handler: this.onNewFile,
                scope: this
            },{
                text: 'newfolder',
                handler: this.onNewFolder,
                scope: this
            },{
                text: 'copy',
                handler: this.onCopy,
                scope: this
            },{
                text: 'paste',
                handler: this.onPaste,
                scope: this
            },{
                text: 'rename',
                handler: this.onRename,
                scope: this
            },{
                text: 'delete',
                handler: this.onDelete,
                scope: this
            }]
        });
        me.filemenu = new Ext.menu.Menu({
            items: [{
                text: 'copy',
                handler: this.onCopy,
                scope: this
            },{
                text: 'rename',
                handler: this.onRename,
                scope: this
            },{
                text: 'delete',
                handler: this.onDelete,
                scope: this
            }]
        });
        me.editor = new Ext.Editor({
            field: {
                xtype: 'textfield',
                selectOnFocus: true,
                allowOnlyWhitespace: false
            },
            completeOnEnter: true,
            cancelOnEsc: true
        });
    //    this.on('itemclick',this.onItemclick);
        this.on('itemcontextmenu',this.onContextItem);
        this.on('beforeload',this.onBeforeLoad);
        this.callParent();
    },

    onBeforeLoad: function(store, operation, eOpts){
    //    console.log(operation.config.id);
        record = store.getNodeById(operation.config.id);
        store.proxy.extraParams.path = record.data.path;
    //    operation.proxy.extraParams.path = 'wps';
    },

    onCopy: function(){
        this.copy = this.record;
    },

    onPaste: function(){
        var me = this;
        var address = me.address;
        var treeStore = me.getStore();
        var src = me.copy.data.path;
        var dst = me.record.data.path;
        Ext.Ajax.request({
            url: address.urlCpmv,
            method: 'PUT',
            params: {cmd: 'copy', src: src, dst: dst},
            headers: {
                Authorization: token
            },
            success: function (response, options) {
            //    var res = Ext.decode(response.responseText);
            //    alert(res.log);
                var record = me.getSelection()[0];
                var newre = record.appendChild({
                    text: me.copy.data.text,
                    path: dst+'/'+me.copy.data.text,
                    leaf: me.copy.data.leaf,
                    expanded: false
                });
                newre.dirty = false;
                newre.phantom = false;
            //    console.log(newre);
            },
            failure: function (response, options) {
                alert('fail');
            }
        });
    },

    onNewFile: function(){
        var address = this.address;
        var record = this.getSelection()[0];
        var newre = record.appendChild({
            text: 'newfile',
        //    id: record.get('id')+'/newfile',
            leaf: true
        });

        var tabs = this.up('filebrowser').down('tabpanel');
        var tabId = 'tab-files';
        var tab = tabs.getComponent(tabId);
        var tabstore = tab.down('dataview').getStore();

        var me = this;
        me.editor.startEdit(Ext.get(me.HTMLTarget), 'newfile');
        me.editor.on('complete', function(me, value){
            var path = record.get('path')+'/'+value;
            var re = this;
        //    treeStore.sync();
            Ext.Ajax.request({
                url: address.urlNewFile,
                method: 'POST',
                params: {cmd: 'new', content: '', path: path},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    re.set('text', value);
                    re.set('path', path);
                    tabstore.reload();
                    //var res = Ext.decode(response.responseText);
                    //alert(res.log);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }, newre, {single: true});
    },

    onNewFolder: function(){
        var address = this.address;
        var record = this.getSelection()[0];
        var newre = record.appendChild({
            text: 'newfolder',
        //    id: record.get('id')+'/newfolder',
            leaf: false,
            expanded: false
        });

        var tabs = this.up('filebrowser').down('tabpanel');
        var tabId = 'tab-files';
        var tab = tabs.getComponent(tabId);
        var tabstore = tab.down('dataview').getStore();

        var me = this;
        me.editor.startEdit(Ext.get(me.HTMLTarget), 'newfolder');
        me.editor.on('complete', function(me, value){
            var path = record.get('path')+'/'+value;
            var re = this;
        //    treeStore.sync();
            Ext.Ajax.request({
                url: address.urlNewDirectory,
                method: 'POST',
                params: {path: path},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    re.set('text', value);
                    re.set('path', path);
                    tabstore.reload();
                    //var res = Ext.decode(response.responseText);
                    //alert(res.log);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }, newre, {single: true});
    },

    onRename: function(){
        var me = this;
        var address = me.address;
        var record = me.record;
        me.editor.startEdit(Ext.get(me.HTMLTarget), me.record.get('text'));
        me.editor.on('complete', function(me, value, startValue){
            if(value == startValue){
                record.set('text', value);
                return;
            }
            var newname = record.parentNode.get('path') + '/' +value;
            Ext.Ajax.request({
                url: address.urlRename,
                method: 'PUT',
                params: {path: record.get('path'), newname: newname},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    record.set('text', value);
                    record.set('path', newname);
                    //var res = Ext.decode(response.responseText);
                    //alert(res.rename);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }, me, {single: true});
    },

    onDelete: function(){
        var address = this.address;
        var record = this.record;
        var tabs = this.up('filebrowser').down('tabpanel');
        var tabId = 'tab-files';
        var tab = tabs.getComponent(tabId);
        var tabstore = tab.down('dataview').getStore();
        Ext.Ajax.request({
            url: address.urlDelete,
            method: 'DELETE',
            params: {path: record.get('path')},
            headers: {
                Authorization: token
            },
            success: function (response, options) {
                record.remove(true);
                var lastOptions = tabstore.lastOptions,
                    lastParams = Ext.clone(lastOptions.params);
                if(lastParams == null){
                    tabstore.load();
                }else if(lastParams.node != record.get('path')){
                    tabstore.reload();
                }else{
                    tabstore.removeAll();
                }
                //var res = Ext.decode(response.responseText);
                //alert(res.delete);
            },
            failure: function (response, options) {
                alert('fail');
            }
        });
    },

    onContextItem: function(view, record, item, index, e, eOpts){
        var me = this;
        var menu;
        if(record.data.leaf){
            menu = me.filemenu;
        }else{
            menu = me.foldermenu;
        //    if(record.parentNode.get('text') == 'localfolder'){

        //    }
        }
        me.record = record;
        me.HTMLTarget = item;

        e.stopEvent();
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onExpandAllClick: function(){
        var me = this,
            toolbar = me.down('toolbar');

        me.getEl().mask('Expanding tree...');
        toolbar.disable();

        this.expandAll(function() {
            me.getEl().unmask();
            toolbar.enable();
        });
    },

    onCollapseAllClick: function(){
        var toolbar = this.down('toolbar');

        toolbar.disable();
        this.collapseAll(function() {
            toolbar.enable();
        });
    }

});


Ext.define('treeController',{
    extend: 'Ext.app.ViewController',
    alias: 'controller.treeController',

    onrefresh: function(){
        var view = this.getView();
        var treeStore = view.getStore();
        treeStore.getRootNode().removeAll();
        treeStore.load({params:{cmd:'get',path:'localfolder'}});
    }
});
