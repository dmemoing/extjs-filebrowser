Ext.define('FileBrowser.FileBrowser.Files',{
    extend: 'Ext.panel.Panel',
    xtype: 'files',

    cls: 'browser-view',
    tbar:[{
        xtype: 'button',
        width : 24,
        height : 24,
        text: null,
        cls: 'folderUp',
        handler: function(btn){
            var textfd = btn.up('panel').down('textfield');
            var nodeID = textfd.getValue();
            if(nodeID == 'localfolder'){
                return;
            }
            var index = (new String(nodeID)).lastIndexOf('/');
            var pathUp = nodeID.substring(0,index);
            btn.up('panel').down('dataview').getStore().load({params:{cmd: 'get', path: pathUp}});
            textfd.setValue(pathUp);
        }
    },{
        xtype: 'textfield',
        flex: 1,
        value: 'localfolder',
        validateOnBlur:false,
        validateOnChange:false,
        listeners:{
            specialkey: function(field, e){
                if (e.getKey() == e.ENTER) {
                    var viewStore = field.up('panel').down('dataview').getStore();
                    viewStore.load({params:{cmd: 'get', path: field.getValue()}});
                }
            }
        }
    }],
    items: {
        xtype: 'dataview',
        autoScroll: true,
        tpl: [
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                    '<div class="thumb"><img src="resources/images/{leaf}.png" title="{text}"></div>',
                    '<span class="x-editable">{text}</span>',
                '</div>',
            '</tpl>',
            '<div class="x-clear"></div>'
        ],
        selectionModel: {
            mode: 'MULTI'
        },
        trackOver: true,
        itemSelector: 'div.thumb-wrap',
        overItemCls: 'x-item-over',
        plugins: [
            Ext.create('Ext.ux.DataView.DragSelector', {})
        //    {xclass: 'Ext.ux.DataView.Animated'}
        ],
        itemSelector: 'div.thumb-wrap'
    },

    initComponent: function () {
        var address = this.address;
        store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            sortOnLoad: true,
            fields: ['text', 'leaf', 'path'],
            proxy: {
                type: 'ajax',
                actionMethods: {
                    read: 'GET'
                },
                url : address.urlGet,
                headers: {
                    Authorization: token
                },
                extraParams: {
                    cmd: 'get',
                    path: 'localfolder'
                },
                reader: {
                    type: 'json',
                    rootProperty: ''
                }
            }
        })
        this.items.store = store;
        var me = this;
        me.contextmenu = new Ext.menu.Menu({
            items: [{
                text: 'copy',
                handler: this.onCopy,
                scope: this
            },{
                text: 'cut',
                handler: this.onCut,
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
        me.panelmenu = new Ext.menu.Menu({
            items: [{
                text: 'refresh',
                handler: this.onRefresh,
                scope: this
            },{
                text: 'paste',
                handler: this.onPaste,
                scope: this
            },{
                text: 'newfile',
                handler: this.onNewFile,
                scope: this
            },{
                text: 'newfolder',
                handler: this.onNewFolder,
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
            cancelOnEsc: true,
            shim: false,
            width: '64px',
            autoSize: {
                height: 'field'
            }
        });
    /*    me.editor = Ext.create('Ext.ux.DataView.LabelEditor', {
            dataIndex: 'text'
        });
        me.items.plugins.push(me.editor);*/
        me.callParent();
        me.down('dataview').on('itemcontextmenu',this.onContextMenu);
    },

    afterRender: function () {
        var me = this;
        me.callParent();
        me.el.on('contextmenu', me.onPanelMenu, me);
    },

    onPanelMenu: function(e){
        var me = this, menu = me.panelmenu;
        e.stopEvent();
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onContextMenu: function(view, record, item, index, e, eOpts){
        var me = this.up('panel'), menu = me.contextmenu;

        var selModel = view.selModel;
        if(!selModel.isSelected(record)){
            selModel.select(record);
        }

        me.record = record;
        me.item = item;

        e.stopEvent();
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onRefresh: function(){
        this.down('dataview').getStore().reload();
    },

    onCopy: function(){
        var view = this.down('dataview');
        var records = view.getSelectionModel().getSelection();
        this.copy = records;
        this.copyOrCut = 'copy';
    },

    onCut: function(){
        var view = this.down('dataview');
        var records = view.getSelectionModel().getSelection();
        this.copy = records;
        this.copyOrCut = 'move';
    },

    onPaste: function(){
        var me = this;
        var address = me.address;
        var view = me.down('dataview');
        var viewStore = view.getStore();
        var copyOrCut = me.copyOrCut;
        var dst = me.down('textfield').getValue();
        for(var i = 0; i < me.copy.length; i++) {
            var src = me.copy[i].data.path;
        //    console.log(records[i].data.text);
            viewStore.add({
                text: me.copy[i].data.text,
                path: dst+'/'+me.copy[i].data.text,
                leaf: me.copy[i].data.leaf
            });
            Ext.Ajax.request({
                url: address.urlCpmv,
                method: 'PUT',
                params: {cmd: copyOrCut, src: src, dst: dst},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                //    var res = Ext.decode(response.responseText);
                //    alert(res.log);
                    
                //    console.log(newre);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }
    },

    onNewFile: function(){
        var me = this;
        var address = me.address;
        var view = me.down('dataview');
        var viewStore = view.getStore();
        var newre = viewStore.add({'text': 'newfile', 'leaf': true});

        var item = view.getNode(newre[0]);
        var el = Ext.get(item);
        var target = el.selectNode('span.x-editable',false);
        me.editor.startEdit(target, 'newfile');

        var parent = me.down('textfield').getValue();
        me.editor.on('complete', function(me, value, startValue){
            var path = parent + '/' +value;
        //    treeStore.sync();
            Ext.Ajax.request({
                url: address.urlNewFile,
                method: 'POST',
                params: {cmd: 'new', content: '', path: path},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    newre[0].set('text', value);
                    newre[0].set('path', path);
                    //var res = Ext.decode(response.responseText);
                    //alert(res.log);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }, me, {single: true});
    },

    onNewFolder: function(){
        var me = this;
        var address = me.address;
        var view = me.down('dataview');
        var viewStore = view.getStore();
        var newre = viewStore.add({'text': 'newfile', 'leaf': false});

        var item = view.getNode(newre[0]);
        var el = Ext.get(item);
        var target = el.selectNode('span.x-editable',false);
        me.editor.startEdit(target, 'newfolder');

        var parent = me.down('textfield').getValue();
        me.editor.on('complete', function(me, value, startValue){
            var path = parent + '/' +value;
        //    treeStore.sync();
            Ext.Ajax.request({
                url: address.urlNewDirectory,
                method: 'POST',
                params: {path: path},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    newre[0].set('text', value);
                    newre[0].set('path', path);
                    //var res = Ext.decode(response.responseText);
                    //alert(res.log);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }, me, {single: true});
    },


    onRename: function(){
    /*    var view = this.down('dataview');
        var records = view.getSelectionModel().getSelection();

        // process selected records         
        for(var i = 0; i < records.length; i++) {
            console.log(records[i].data.text);
        }*/
        var me = this;
        var address = me.address;
        var record = me.record;

        var el = Ext.get(me.item);
        var target = el.selectNode('span.x-editable',false);
        me.editor.startEdit(target, me.record.get('text'));

        var nodePath = record.get('path');
        var index = (new String(nodePath)).lastIndexOf('/');
        var parentName = nodePath.substring(0,index);
        me.editor.on('complete', function(me, value, startValue){
            if(value == startValue){
            //    alert('same');
                return;
            }
        //    alert('hello');
            var newname = parentName + '/' +value;
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

    /*    var me = this;
        var record = me.activeRecord;

        var el = Ext.get(me.item);
        var target = el.selectNode('span.x-editable',false);
        me.editor.startEdit(target,record.get('text'));

        me.editor.onSave*/
    },

    onDelete: function(){
        var address = this.address;
        var view = this.down('dataview');
        var records = view.getSelectionModel().getSelection();
        var view = this.down('dataview');
        var viewStore = view.getStore();
        for(var i=0; i < records.length; i++){
            Ext.Ajax.request({
                url: address.urlDelete,
                method: 'DELETE',
                params: {path: records[i].get('path')},
                headers: {
                    Authorization: token
                },
                success: function (response, options) {
                    //var res = Ext.decode(response.responseText);
                    //alert(res.delete);
                },
                failure: function (response, options) {
                    alert('fail');
                }
            });
        }
        viewStore.remove(records);
    }
});