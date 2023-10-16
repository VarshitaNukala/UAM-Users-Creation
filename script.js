import { roles, profiles, countries, divisions, BusinessUnits, BusinessUnitsMap, productGroups, productGroupsMap, departmentTypes } from "./helper.js"

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const fieldsToIgnore = ['Are you a Sales user', 'Are you a Factory User', 'Do you need access to Salesforce  Quotation', 'Business Justification', 'Permission set', 'Region', 'Street', 'City', 'Country', 'Subregion', 'Counrty', 'HUB']
    const fieldsToIgnoreFromReferenceUser = ['_', 'Id', 'UserRole', 'Profile']
    const tablesDiv = document.getElementById("tables");
    const allUsersTable = document.getElementById("allUsersTable");
    const populateButton = document.getElementById("populateData");
    const clipboardInput = document.getElementById("clipboardInput");
    const downloadButton = document.getElementById("downloadData");
    const copyToClipboardButton = document.getElementById("copyToClipboardButton")
    const deleteUsersButton = document.getElementById('deleteUsersButton');




    const retrieveData = document.getElementById('retrieveData')
    const clearLocalStorage = document.getElementById('clearLocalStorage')
    let data
    let referenceUserData = []
    let populatedTable, allPopulatedTable;

    let table1
    const storageKey = 'myData';
    let usersData = JSON.parse(localStorage.getItem(storageKey)) || [];


    deleteUsersButton.addEventListener('click', function () {

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const selectedIndexes = [];

        // Iterate through the checkboxes and populate the selectedIndexes array with the indexes of checked checkboxes.
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                selectedIndexes.push(index);
            }
        });


        // Now, iterate through the selectedIndexes array and delete the corresponding users from usersData.
        selectedIndexes.sort((a, b) => b - a); // Sort in descending order to avoid index shifting

        selectedIndexes.forEach((index) => {
            if (index >= 0 && index < usersData.length) {
                usersData.splice(index, 1); // Use splice to remove elements
            }
        });
        const key = 'myData'; // The key under which your data is stored

        const newData = JSON.stringify(usersData);
        const data = localStorage.getItem(key)
        localStorage.setItem(key, newData);
        while (allUsersTable.firstChild) {
            allUsersTable.removeChild(allUsersTable.firstChild);
        }

        if (usersData.length == 0) {
            while (allUsersTable.firstChild) {
                allUsersTable.removeChild(allUsersTable.firstChild);
            }
        }
        else {
            allPopulatedTable = createTable(usersData, true)
            allPopulatedTable.id = "populatedTable";

            // Append the populated table to the tablesDiv
            allUsersTable.appendChild(allPopulatedTable);


            downloadButton.style.display = 'block'
            copyToClipboardButton.style.display = 'block'
        }
    });

    clearLocalStorage.addEventListener('click', function () {
        if (usersData.length == 0) {
            alert("No user's data to clear")
        }
        while (allUsersTable.firstChild) {
            allUsersTable.removeChild(allUsersTable.firstChild);
        }
        localStorage.clear()
        alert("User's data is cleared")
        usersData = []
    })

    clipboardInput.addEventListener("change", function () {
        data = clipboardInput.value;

    })
    copyToClipboardButton.addEventListener("click", function () {
        const formattedData = getFormattedData(); // Replace this with the code to generate formatted data

        navigator.clipboard.writeText(formattedData)
            .then(() => {
                alert("Data copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy data to clipboard: ", err);
            });
    });

    // Function to generate formatted data (replace with your code)
    function getFormattedData() {

        const formattedData = [];

        // Add the header row.
        formattedData.push(Object.keys(usersData[0]));

        // Add the value rows.
        for (const dataMap of usersData) {
            formattedData.push(Object.values(dataMap));
        }

        // Convert the data into a tab-separated string.
        const tsvData = formattedData.map(row => row.join('\t')).join('\n');
        return tsvData



    }

    retrieveData.addEventListener('click', function () {
        fileInput.value = null
        clipboardInput.value = ''
        if (usersData.length > 0) {
            deleteUsersButton.style.display = 'block'
        }

        while (allUsersTable.firstChild) {
            allUsersTable.removeChild(allUsersTable.firstChild);
        }
        const dataJSON = localStorage.getItem(storageKey);
        usersData = JSON.parse(dataJSON) || [];
        if (usersData.length == 0) {
            alert("No user's data to populate")
        }
        else {
            allPopulatedTable = createTable(usersData, true)
            allPopulatedTable.id = "populatedTable";

            // Append the populated table to the tablesDiv
            allUsersTable.appendChild(allPopulatedTable);
            while (tablesDiv.firstChild) {
                tablesDiv.removeChild(tablesDiv.firstChild);
            }

            downloadButton.style.display = 'block'
            copyToClipboardButton.style.display = 'block'
        }


    });

    const doesRoleExist = (key, array) => {
        return roles.find(function (element) {
            return key === element;
        });
    };

    const doesProfileExist = (key, array) => {
        return profiles.find(function (element) {
            return key === element;
        });
    };

    const setOtherValues = (finalData) => {
        finalData['Business_Area_UAM__c'] = finalData['Division_DIV__c']

        if ((finalData['Profile:Profile:Name'] == 'ABB Sales Standard Profile' || finalData['Profile:Profile:Name'] == 'ABB Customer Support Profile') && finalData['Business_Area_UAM__c'] === 'MO') {
            finalData['Empolis_Visible__c'] = true
            finalData['UserPermissionsKnowledgeUser'] = true
            finalData['FSLABB_Case_Data_PrePop__c'] = true
        }
        if (finalData['Profile:Profile:Name'] == 'ABB Customer Support Profile') {
            finalData['UserPermissionsMarketingUser'] = true
        }
        if (((finalData['Profile:Profile:Name'] == 'ABB Sales Standard Profile' || finalData['Profile:Profile:Name'] == 'ABB Customer Support Profile') && finalData['Business_Area_UAM__c'] === 'IA') || (finalData['Profile:Profile:Name'] == 'ABB Customer Support Profile' && finalData['Business_Area_UAM__c'] === 'RA')) {
            finalData['Empolis_Visible__c'] = true

        }




    }
    const getCountry = (email) => {
        const ind = email.indexOf("@");
        const my_slice = email.substr(ind + 1, 2);
        return countries[my_slice]
    }

    const getBusinessUnits = (value) => {
        const idx = BusinessUnits.indexOf(value)
        return idx != -1 ? BusinessUnits[idx] : BusinessUnitsMap[value]
    }
    const getProductGroups = (value) => {
        const idx = productGroups.indexOf(value)
        return idx != -1 ? productGroups[idx] : productGroupsMap[value]
    }
    const getDepartmentType = (value) => {
        return departmentTypes[productGroups.indexOf(value)]
    }

    const getDivisions = (value) => {
        return divisions[divisions.indexOf(value)]
    }

    let sheet1Data = [];
    let sheetData = [];
    let userData = [];

    fileInput.addEventListener("change", function (event) {
        deleteUsersButton.style.display = 'none'
        populateButton.disabled = false;
        const file = event.target.files[0];
        while (tablesDiv.firstChild) {
            tablesDiv.removeChild(tablesDiv.firstChild);
        }
        clipboardInput.value = ''
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                while (tablesDiv.firstChild) {
                    tablesDiv.removeChild(tablesDiv.firstChild);
                }
                clipboardInput.value = ''



                sheet1Data = [];
                sheetData = [];
                userData = [];
                referenceUserData = []

                if (workbook.SheetNames.length > 0) {
                    const sheetName = workbook.SheetNames[0]; // Get the name of the first sheet

                    if (sheetName) {
                        let criteriaRow = null;
                        let columnNames = [];
                        let jsonData

                        for (const cell in workbook.Sheets[sheetName]) {
                            const cellValue = workbook.Sheets[sheetName][cell].v;

                            // Check if the value in the first column is "username"
                            if (cell.startsWith('A') && cellValue === 'User Name') {
                                criteriaRow = cell;
                                break; // Stop after finding the first matching row
                            }
                        }
                        if (criteriaRow) {
                            // Extract column names from the criteria row
                            for (const col in workbook.Sheets[sheetName]) {
                                if (col.startsWith(criteriaRow.charAt(0))) {
                                    columnNames.push(workbook.Sheets[sheetName][col].v);
                                }
                            }
                            const lastColumn = Object.keys(workbook.Sheets[sheetName]).filter(col => col.startsWith(criteriaRow.charAt(0))).pop();


                            // Use XLSX.utils.sheet_to_json with the specified range
                            jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {

                                defval: '',
                                range: `A${parseInt(criteriaRow.substring(1))}:${lastColumn}` // Start reading data from A5
                            });

                        } else {
                            console.error("Criteria row not found.");
                        }



                        let count = 0;
                        for (let d in sheet1Data) {

                            if (sheet1Data[d]['Red Marked Columns are Mandatory '] === 'User Name') {

                                break;
                            }
                            count++;

                        }


                        sheetData = jsonData




                    } else {
                        //console.error('Sheet name is undefined.');
                    }
                } else {
                    //console.error('No sheets found in the workbook.');
                }


                renderTables();

            };
            reader.readAsBinaryString(file);
        }



    });

    const setDataFromReferenceUser = (finalData, key, value) => {
        if (!finalData[key]) {

            if (key == 'Profile.Name') {
                if (doesProfileExist(value)) {
                    finalData['Profile:Profile:Name'] = value
                }

            }
            else if (key == 'UserRole.Name') {
                if (doesRoleExist(value)) {
                    finalData['UserRole:UserRole:Name'] = value
                }
            }

            else {
                finalData[key] = value
            }
        }
    }
    populateButton.addEventListener("click", function () {
        deleteUsersButton.style.display = 'none'
        fileInput.value = null;
        clipboardInput.value = ''
        if (sheetData.length === 0) {
            alert("Please upload Excel data before populating.");
            return;
        }

        // Implement your data comparison and population logic here
        // For this example, let's assume we want to merge the data from both sheets based on a common key (e.g., "ID").

        // Create a map to store the data from Sheet2 for quick lookup





        var lines = data.trim().split('\n');
        var headers = lines[0].split('\t');
        var values = lines[1].split('\t');
        var jsonData = {};
        for (var i = 0; i < headers.length; i++) {
            var key = headers[i].replace(/"/g, ''); // Remove double quotes
            var value = values[i].replace(/"/g, ''); // Remove double quotes
            jsonData[key] = value;


        }
        referenceUserData.push(jsonData)
        sheetData.forEach((val) => {

            let finalData = new Map();
            setData(val, finalData)
            referenceUserData.forEach((value, key) => {
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        const v = value[k];


                        if (k == 'UserRole.Name' && finalData['UserRole:UserRole:Name'] && finalData['UserRole:UserRole:Name'] != v) {
                            alert('The role of the user and reference user do not match.')
                            continue
                        }
                        else if (k == 'Profile.Name' && finalData['Profile:Profile:Name'] && finalData['Profile:Profile:Name'] != v) {
                            alert('The profile of the user and refernce user do not match.')
                            continue

                        }
                        else if (k == 'Division_DIV__c' && finalData[k] && finalData['Division_DIV__c'] != v) {
                            alert('The Business Area(Division_DIV__c) of the user and reference user do not match.')
                            // finalData['Division_DIV__c']=''
                            // finalData['Business_Area_UAM__c']=''
                            // finalData['Business_Unit_BU__c']=''
                            // finalData['Product_Group_PG__c']=''
                            continue
                        }

                        else if (!finalData[k]) {
                            if (k === '_' || k === 'UserRole' || k === 'Profile' || k === 'Id') {
                                continue
                            }
                            else {
                                setDataFromReferenceUser(finalData, k, v)
                            }
                        }
                    }
                }
            })
            setOtherValues(finalData);
            userData.push(finalData)



        })

        let finalData = userData[0]

        for (var key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                fieldsToIgnoreFromReferenceUser.forEach((keyToDelete) => {
                    if (key === keyToDelete) {
                        delete jsonData[key]; // Delete the key if it exists in the object
                    }
                });
            }
        }





        const table2 = createTableFromMap(jsonData);
        tablesDiv.innerHTML = "";
        tablesDiv.appendChild(table1);
        tablesDiv.appendChild(table2);

        // referenceUserData.forEach((value, key) => {
        //     for (const k in value) {
        //         if (value.hasOwnProperty(k)) {
        //             const v = value[k];


        //             if (k == 'UserRole.Name' && finalData['UserRole:UserRole:Name'] && finalData['UserRole:UserRole:Name'] != v) {
        //                 alert('The role of the user and reference user do not match.')
        //                 continue
        //             }
        //             else if (k == 'Profile.Name' && finalData['Profile:Profile:Name'] && finalData['Profile:Profile:Name'] != v) {
        //                 alert('The profile of the user and refernce user do not match.')
        //                 continue

        //             }
        //             else if (k == 'Division_DIV__c' && finalData[k] && finalData['Division_DIV__c'] != v) {
        //                 alert('The Business Area(Division_DIV__c) of the user and reference user do not match.')
        //                 // finalData['Division_DIV__c']=''
        //                 // finalData['Business_Area_UAM__c']=''
        //                 // finalData['Business_Unit_BU__c']=''
        //                 // finalData['Product_Group_PG__c']=''
        //                 continue
        //             }

        //             else if (!finalData[k]) {
        //                 if (k === '_' || k === 'UserRole' || k === 'Profile' || k === 'Id') {
        //                     continue
        //                 }
        //                 else {
        //                     setDataFromReferenceUser(finalData, k, v)
        //                 }
        //             }
        //         }
        //     }
        // })





        usersData = [...usersData, ...userData]
        const dataJSON = JSON.stringify(usersData);

        // Store the JSON string in local storage
        localStorage.setItem('myData', dataJSON);


        populatedTable = createTable(userData);

        downloadButton.style.display = "none"
        copyToClipboardButton.style.display = 'none'


        populatedTable.id = "populatedTable";

        while (allUsersTable.firstChild) {
            allUsersTable.removeChild(allUsersTable.firstChild);
        }

        // Append the populated table to the tablesDiv
        tablesDiv.appendChild(populatedTable);
        fileInput.value = null
        copyToClipboardButton.value = ''
        populateButton.disabled = true;

    });
    // Function to render tables
    function createTableFromMap(dataObject) {

        const table = document.createElement("table");

        // Create the table header row
        const headerRow = table.insertRow();
        for (const key in dataObject) {
            if (dataObject.hasOwnProperty(key)) {
                const th = document.createElement("th");
                th.textContent = key;
                headerRow.appendChild(th);
            }
        }

        // Create a single row for the values
        const valuesRow = table.insertRow();
        for (const key in dataObject) {
            if (dataObject.hasOwnProperty(key)) {
                const cell = valuesRow.insertCell();
                cell.textContent = dataObject[key];
            }
        }

        return table;
    }
    function renderTables() {

        if (sheetData[0]['User Name'] === 'Suhey Maldonado') {
            sheetData = sheetData.slice(1)
        }


        sheetData.forEach((obj) => {
            fieldsToIgnore.forEach((key) => {
                if (obj.hasOwnProperty(key)) {
                    delete obj[key]; // Delete the key if it exists in the object
                }
            });
        });


        table1 = createTable(sheetData);

        referenceUserData.forEach((obj) => {
            // Loop through the keys to delete
            fieldsToIgnoreFromReferenceUser.forEach((key) => {
                if (obj.hasOwnProperty(key)) {
                    delete obj[key]; // Delete the key if it exists in the object
                }
            });
        });



    }
    // function createTable(data) {
    //     const table = document.createElement("table");
    //     const headerRow = table.insertRow(0);
    //     for (const key in data[0]) {
    //         const th = document.createElement("th");
    //         th.textContent = key;
    //         headerRow.appendChild(th);
    //     }
    //     data.forEach((row, index) => {
    //         const newRow = table.insertRow();

    //         for (const key in row) {
    //             const cell = newRow.insertCell();
    //             cell.textContent = row[key];
    //         }
    //     });
    //     return table;
    // }

    function createTable(data, needCheckbox) {
        const table = document.createElement("table");
        const headerRow = table.insertRow(0);

        // Create a new column for the checkboxes in the header.
        const checkboxHeader = document.createElement("th");
        if (needCheckbox) {
            checkboxHeader.textContent = "Delete User"; // Set the column name.
            headerRow.appendChild(checkboxHeader);
        }

        for (const key in data[0]) {
            const th = document.createElement("th");
            th.textContent = key;
            headerRow.appendChild(th);
        }

        data.forEach((row, index) => {
            const newRow = table.insertRow();

            // Create the checkbox column.
            if (needCheckbox) {
                const checkboxCell = newRow.insertCell();

                // Create a unique checkbox ID based on the row index.
                const checkboxId = `checkbox-${index}`;

                // Create the checkbox element and set its attributes.
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = checkboxId;

                // Append the checkbox to the cell.
                checkboxCell.appendChild(checkbox);
            }

            for (const key in row) {
                const cell = newRow.insertCell();
                cell.textContent = row[key];
            }
        });

        return table;
    }

    const setData = (value, finalData) => {
        const fullName = value['User Name'].split(" ");
        //Full Name Field
        if (fullName.length > 1) {
            finalData['FirstName'] = fullName[0];
            finalData['LastName'] = fullName[1];
            finalData['Alias'] = fullName[1].length >= 3 ? (fullName[0].slice(0, 1) + fullName[1].slice(0, 3)).toLowerCase() : (fullName[0].slice(0, (5 - fullName[1].length)) + fullName[1].slice(0, 3)).toLowerCase();

        }
        else {
            finalData['LastName'] = fullName[0];
            finalData['Alias'] = (fullName[0].slice(0, 4)).toLowerCase();
        }
        //Email Username FederationIdentifier
        finalData['Email'] = value['User email'];
        finalData['Username'] = value['User email'];
        finalData['FederationIdentifier'] = value['User email'].toLowerCase();

        //Title, Department, Company Name

        finalData['Title'] = value['Job Title'];
        finalData['CompanyName'] = value['Company Name'];
        finalData['Department'] = value['Department'];

        //Country
        finalData['Country'] = getCountry(value['User email'])

        //Phone Mobile
        finalData['Phone'] = value['Phone Number']
        finalData['MobilePhone'] = value['Mobile Number']

        //Division
        finalData['Division_DIV__c'] = getDivisions(value['Business ']) || getDivisions(value['Business Area '])
        finalData['Business_Area_UAM__c'] = finalData['Division_DIV__c']

        //Business_Unit_BU__c
        finalData['Business_Unit_BU__c'] = getBusinessUnits(value['Division'])

        //Product Groups
        finalData['Product_Group_PG__c'] = getProductGroups(value['Product Group'])

        //Department_type
        finalData['Department_Type__c'] = getDepartmentType(value['Department type'])

        finalData['TimeZoneSidKey'] = 'Europe/Berlin'
        finalData['LocaleSidKey'] = 'en_GB'

        finalData['EmailEncodingKey'] = 'UTF-8'
        finalData['LanguageLocaleKey'] = 'en_US'
        if (doesRoleExist(value['Role'])) {
            finalData[`UserRole:UserRole:Name`] = value['Role']
        }
        if (doesProfileExist(value['Profile'])) {
            finalData[`Profile:Profile:Name`] = value['Profile']
        }



    }

    // Function to create a table from data

    downloadButton.addEventListener("click", function () {
        if (usersData.length === 0) {
            alert("No user's data is populated");
            return;
        }

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Convert your single key-value pair object to an array of objects
        const jsonArray = usersData;

        // Convert the array to a sheet
        const ws1 = XLSX.utils.json_to_sheet(jsonArray);

        // Add the sheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws1, "Sheet1");

        // Generate the Excel file as an ArrayBuffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        // Convert the ArrayBuffer to a Blob
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = "populated_data.xlsx";

        // Trigger a click event to download the file
        a.click();

        // Clean up the URL and the anchor element
        URL.revokeObjectURL(url);
    });

})