export function addColumnToTable(table_name,column_name,attributes){
    const Q = `ALTER TABLE ${table_name} ADD COLUMN IF NOT EXISTS ${column_name} ${attributes};`
    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(Error(`Alter tables ${res.error}`));
            }
        })
    })

}