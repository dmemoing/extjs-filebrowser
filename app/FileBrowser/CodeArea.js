Ext.define('FileBrowser.FileBrowser.CodeArea',{
    extend: 'Ext.panel.Panel',
    xtype: 'codeArea',
    tbar:[{
        width: 125,
        xtype: 'combo',
        queryMode: 'local',
        value: 'text/plain',
        triggerAction: 'all',
        forceSelection: true,
        editable: false,
    //    fieldLabel: 'Title',
        name: 'title',
        displayField: 'name',
        valueField: 'value',
        store: {
            fields: ['name', 'value'],
            data: [
                {name: 'text/plain', value: 'text/plain'},
                {name: 'C', value: 'text/x-csrc'},
                {name: 'C++', value: 'text/x-c++src'},
                {name: 'C#', value: 'text/x-csharp'},
                {name: 'CSS', value: 'text/css'},
                {name: 'django', value: 'django'},
                {name: 'go', value: 'go'},
                {name: 'HTML', value: 'htmlmixed'},
                {name: 'http', value: 'http'},
                {name: 'java', value: 'text/x-java'},
                {name: 'javascript', value: 'javascript'},
                {name: 'Objective-C', value: 'text/x-objectivec'},
                {name: 'perl', value: 'perl'},
                {name: 'php', value: 'php'},
                {name: 'python', value: 'python'},
                {name: 'r', value: 'r'},
                {name: 'shell', value: 'shell'},
                {name: 'swift', value: 'swift'},
                {name: 'sql', value: 'sql'},
                {name: 'xml', value: 'xml'}
            ]
        },
        listeners:{
            scope: this,
            'select': function(combo,record){
                var codeMirror = combo.up('panel').getCodeMirror();
                codeMirror.setOption('mode',record.data.value);
            }
        }
    },'->',{
        xtype: 'button',
        width: 75,
        text: 'save',
        disabled: true,
        listeners:{
            click: function(btn){
            //    alert(btn.up('panel').getCodeMirror().getValue());
            //    alert(btn.up('panel').address);
                var value = btn.up('panel').getCodeMirror().getValue();
                var path = btn.up('panel').address;
                var urlSave = btn.up('panel').urlSave;
                Ext.Ajax.request({
                    url: urlSave,
                    method: 'POST',
                    params: {cmd: 'update', content: value, path: path},
                    headers: {
                        Authorization: token
                    },
                    success: function (response, options) {
                        btn.up('panel').saved = true;
                        btn.disable();
                        //var res = Ext.decode(response.responseText);
                        //alert(res.log);
                    },
                    failure: function (response, options) {
                        alert('fail');
                    }
                });
            }
        }
    }],
    items: [{
        xtype: 'textarea',
        autoScroll: true,
        autoWidth: true,
        listeners: {
            //on render of the component convert the textarea into a codemirror.
            afterrender: function(textarea) {
            //    var textarea = Ext.getCmp(areaid);
                var save = textarea.up('panel').down('button');
                
                var codeMirror = CodeMirror.fromTextArea(textarea.inputEl.dom, {
                    mode: { 
                      name: "text/plain", globalVars: true 
                    },
                //    theme: "monokai",
                    keyMap: "sublime",
                    lineNumbers: true,
                    readOnly: false,
                    extraKeys: {"Ctrl-Space":"autocomplete"}
                });
                codeMirror.on('change',function(cm){
                    textarea.up('panel').saved = false;
                    save.enable();
                });
                CodeMirror.commands.save = function(insance){
                    save.fireEvent('click',save);
                };
            }
        }
    }],
    getCodeMirror: function(){
        return this.getEl().query('.CodeMirror')[0].CodeMirror;
    },
    setValue:function(text){
        this.down('textarea').setValue(text);
    },
    setMode:function(text){
        this.getCodeMirror().setOption('mode',text);
        this.down('combo').setValue(text);
    }
});