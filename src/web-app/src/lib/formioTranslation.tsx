const formCsTranslation = {
    unsavedRowsError: "Před pokračováním uložte všechny řádky.",
    invalidRowsError: "Před pokračováním opravte neplatné řádky.",
    invalidRowError: "Neplatný řádek. Opravte ho nebo smažte.",
    alertMessageWithLabel: "{{label}}: {{message}}",
    alertMessage: "{{message}}",
    complete: "Odeslání dokončeno",
    error: "Před odesláním opravte následující chyby.",
    errorListHotkey: "Stiskněte Ctrl + Alt + X pro návrat k seznamu chyb.",
    errorsListNavigationMessage:
        "Klikněte pro navigaci k poli s následující chybou.",
    submitError:
        "Zkontrolujte formulář a opravte všechny chyby před odesláním.",
    required: "{{field}} je vyžadováno",
    unique: "{{field}} musí být jedinečné",
    array: "{{field}} musí být pole",
    array_nonempty: "{{field}} musí být neprázdné pole",
    nonarray: "{{field}} nesmí být pole",
    select: "{{field}} obsahuje neplatný výběr",
    pattern: "{{field}} neodpovídá vzoru {{pattern}}",
    minLength: "{{field}} musí mít alespoň {{length}} znaků.",
    maxLength: "{{field}} nesmí mít více než {{length}} znaků.",
    minWords: "{{field}} musí mít alespoň {{length}} slov.",
    maxWords: "{{field}} nesmí mít více než {{length}} slov.",
    min: "{{field}} nemůže být méně než {{min}}.",
    max: "{{field}} nemůže být více než {{max}}.",
    maxDate: "{{field}} by nemělo obsahovat datum po {{- maxDate}}",
    minDate: "{{field}} by nemělo obsahovat datum před {{- minDate}}",
    maxYear: "{{field}} by nemělo obsahovat rok větší než {{maxYear}}",
    minYear: "{{field}} by nemělo obsahovat rok menší než {{minYear}}",
    invalid_email: "{{field}} musí být platný e-mail.",
    invalid_url: "{{field}} musí být platné URL.",
    invalid_regex: "{{field}} neodpovídá vzoru {{regex}}.",
    invalid_date: "{{field}} není platné datum.",
    invalid_day: "{{field}} není platný den.",
    mask: "{{field}} neodpovídá masce.",
    valueIsNotAvailable: "{{ field }} je neplatná hodnota.",
    stripe: "{{stripe}}",
    month: "Měsíc",
    day: "Den",
    year: "Rok",
    january: "Leden",
    february: "Únor",
    march: "Březen",
    april: "Duben",
    may: "Květen",
    june: "Červen",
    july: "Červenec",
    august: "Srpen",
    september: "Září",
    october: "Říjen",
    november: "Listopad",
    december: "Prosinec",
    next: "Další",
    previous: "Předchozí",
    cancel: "Zrušit",
    submit: "Odeslat formulář",
    confirmCancel: "Opravdu chcete zrušit?",
    saveDraftInstanceError:
        "Nelze uložit koncept, protože neexistuje instance formio.",
    saveDraftAuthError: "Koncept nelze uložit, pokud není uživatel přihlášen.",
    restoreDraftInstanceError:
        "Nelze obnovit koncept, protože neexistuje instance formio.",
    time: "Neplatný čas",
    cancelButtonAriaLabel: "Tlačítko Zrušit. Kliknutím resetujte formulář",
    previousButtonAriaLabel:
        "Předchozí tlačítko. Kliknutím se vrátíte na předchozí kartu",
    nextButtonAriaLabel: "Další tlačítko. Kliknutím přejdete na další kartu",
    submitButtonAriaLabel:
        "Tlačítko Odeslat formulář. Kliknutím odeslat formulář",
};

const formEditCsTranslation = {
    // TODO: Some of the first translations don't work (see issue https://github.com/formio/react/issues/522)
    Title: "Titulek",
    Name: "Jméno",
    "Display as": "Zobrazit jako",
    Type: "Typ",
    Path: "Cesta",
    "Text Field": "Textové pole",
    "Text Area": "Textová oblast",
    Number: "Číslo",
    Password: "Heslo",
    Checkbox: "Zaškrtávací políčko",
    Radio: "Přepínač",
    Select: "Výběr",
    "Select Boxes": "Výběr více možností",
    Button: "Tlačítko",
    Basic: "Základní",
    Advanced: "Pokročilé",
    "Phone Number": "Telefonní číslo",
    Tags: "Štítky",
    Address: "Adresa",
    "Date / Time": "Datum / Čas",
    Day: "Den",
    Time: "Čas",
    Currency: "Měna",
    Survey: "Dotazník",
    Signature: "Podpis",
    Layout: "Rozvržení",
    "HTML Element": "HTML prvek",
    Content: "Obsah",
    Columns: "Sloupce",
    "Field Set": "Sada polí",
    Table: "Tabulka",
    Tabs: "Záložky",
    Hidden: "Skryté",
    Container: "Kontejner",
    "Data Map": "Mapa dat",
    "Data Grid": "Datová mřížka",
    "Edit Grid": "Upravit mřížku",
    Tree: "Strom",
    Display: "Zobrazení",
    Validation: "Ověření",
    Conditional: "Podmíněné zobrazení",
    Logic: "Logika",
    Label: "Popisek",
    "Label Position": "Pozice popisku",
    Placeholder: "Zástupný text",
    Description: "Popis",
    Tooltip: "Nápověda",
    Prefix: "Předpona",
    Suffix: "Přípona",
    "Input Mask": "Vstupní maska",
    "Display Mask": "Maska zobrazení",
    "Allow Multiple Masks": "Povolit více masek",
    "Custom CSS Class": "Vlastní CSS třída",
    Autocomplete: "Automatické dokončování",
    "Hide Label": "Skrýt popisek",
    "Show Word Counter": "Zobrazit počítadlo slov",
    "Show Character Counter": "Zobrazit počítadlo znaků",
    "Hide Input": "Skrýt vstup",
    "Initial Focus": "Počáteční zaměření",
    "Allow Spellcheck": "Povolit kontrolu pravopisu",
    Disabled: "Vypnuto",
    "Table View": "Tabulkové zobrazení",
    "Modal Edit": "Úprava v modálním okně",
    "The label for this field that will appear next to it.":
        "Popisek tohoto pole, který se zobrazí vedle něj.",
    "Adds a tooltip to the side of this field.":
        "Přidá nápovědu na stranu tohoto pole.",
    "Position for the label for this field.": "Pozice popisku tohoto pole.",
    "The placeholder text that will appear when this field is empty.":
        "Zástupný text, který se zobrazí, když je toto pole prázdné.",
    "The description is text that will appear below the input field.":
        "Popis je text, který se zobrazí pod vstupním polem.",
    "The widget is the display UI used to input the value of the field.":
        "Widget je UI zobrazení použité k zadání hodnoty pole.",
    "An input mask helps the user with input by ensuring a predefined format.<br><br>9: numeric<br>a: alphabetical<br>*: alphanumeric<br><br>Example telephone mask: (999) 999-9999<br><br>See the <a target='_blank' href='https://github.com/RobinHerbots/jquery.inputmask'>jquery.inputmask documentation</a> for more information.</a>":
        "Vstupní maska pomáhá uživateli s vstupem tím, že zajistí předdefinovaný formát.<br><br>9: numerický<br>a: abecední<br>*: alfanumerický<br><br>Příklad telefonní masky: (999) 999-9999<br><br>Více informací naleznete v <a target='_blank' href='https://github.com/RobinHerbots/jquery.inputmask'>dokumentaci jquery.inputmask documentation</a>",
    "A display mask helps to display the input in a readable way, this won't affect the  value which will be saved (to affect both view and saved value, delete Display Mask and use Input Mask).<br><br>9: numeric<br>a: alphabetical<br>*: alphanumeric<br><br>Example telephone mask: (999) 999-9999<br><br>See the <a target='_blank' href='https://github.com/RobinHerbots/jquery.inputmask'>jquery.inputmask documentation</a> for more information.</a>":
        "Maska zobrazení pomáhá zobrazit vstup čitelným způsobem, to neovlivní hodnotu, která bude uložena (pro ovlivnění jak zobrazení, tak uložené hodnoty, odstraňte Maska zobrazení a použijte Vstupní masku).<br><br>9: numerický<br>a: abecední<br>*: alfanumerický<br><br>Příklad telefonní masky: (999) 999-9999<br><br>Více informací naleznete v <a target='_blank' href='https://github.com/RobinHerbots/jquery.inputmask'>dokumentaci jquery.inputmask documentation</a>",
    "Custom CSS class to add to this component.":
        "Vlastní CSS třída, která se má přidat k tomuto komponentu.",
    "Indicates whether input elements can by default have their values automatically completed by the browser. See the <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete'>MDN documentation</a> on autocomplete for more information.":
        "Určuje, zda mohou mít vstupní prvky ve výchozím nastavení své hodnoty automaticky dokončeny prohlížečem. Více informací naleznete v <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete'>dokumentaci MDN</a> o automatickém dokončování.",
    "A hidden field is still a part of the form, but is hidden from view.":
        "Skryté pole je stále součástí formuláře, ale je skryté.",
    "Hide the label (title, if no label) of this component. This allows you to show the label in the form builder, but not when it is rendered.":
        "Skrýt popisek (název, pokud není popisek) tohoto komponentu. To vám umožní zobrazit popisek v návrháři formulářů, ale ne při vykreslování.",
    "Show a live count of the number of characters.":
        "Zobrazit aktuální počet znaků.",
    "Show a live count of the number of words.":
        "Zobrazit aktuální počet slov.",
    "Make this field the initially focused element on this form.":
        "Nastaví toto pole jako počáteční zaměřený prvek tohoto formuláře.",
    "Disable the form input.": "Vypnout vstupní prvek.",
    "Shows this value within the table view of the submissions.":
        "Zobrazí tuto hodnotu v tabulkovém zobrazení odevzdání formuláře.",
    "Opens up a modal to edit the value of this component.":
        "Otevře modální okno pro úpravu hodnoty této komponenty.",
    "Hide the input in the browser. This does not encrypt on the server. Do not use for passwords.":
        "Skrýt vstup v prohlížeči. Na serveru se hodnota nešifruje. Nepoužívejte pro hesla.",
    "Sets the tabindex attribute of this component to override the tab order of the form. See the <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex'>MDN documentation</a> on tabindex for more information.":
        "Nastaví tabulátorový index této komponenty pro přepsání pořadí tabulátorů formuláře. Více informací naleznete v <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex'>dokumentaci MDN</a> o tabulátorovém indexu.",
    "To add a tooltip to this field, enter text here.":
        "Chcete-li přidat k tomuto poli nápovědu, zadejte zde text.",
    "Description for this field.": "Popis tohoto pole.",
    Help: "Pomoc",
    "Multiple Values": "Více hodnot",
    "Default Value": "Výchozí hodnota",
    Persistent: "Persitence",
    None: "Žádný",
    Client: "Klient",
    "Input Format": "Formát vstupu",
    Plain: "Prostý",
    "Raw (Insecure)": "Surový (nebezpečný)",
    Protected: "Chráněný",
    "Database Index": "Databázový index",
    "Set this field as an index within the database. Increases performance for submission queries.":
        "Nastaví toto pole jako index v databázi. Zvyšuje výkon pro dotazy na výsledky formuláře.",
    "Text Case": "Velikost písma",
    "When data is entered, you can change the case of the value.":
        "Když jsou zadána data, můžete změnit velikost písma hodnoty.",
    "Mixed (Allow upper and lower case)":
        "Smíšený (povolit velká a malá písmena)",
    Uppercase: "Velká písmena",
    Lowercase: "Malá písmena",
    "Truncate Multiple Spaces": "Sloučit více mezer",
    "Encrypted (Enterprise Only)": "Šifrovaný (pouze Enterprise)",
    "Encryption is not available with your current plan. Please contact sales@form.io.":
        "Šifrování není k dispozici v rámci vašeho současného plánu. Kontaktujte prosím sales@form.io.",
    "Redraw On": "Překreslit při",
    "Any Change": "Jakékoliv změna",
    Submit: "Odeslat",
    "Clear Value When Hidden": "Vymazat hodnotu při skrytí",
    "When a field is hidden, clear the value.":
        "Když je pole skryté, vymažte hodnotu.",
    "Custom Default Value": "Vlastní výchozí hodnota",
    "The following variables are available in all scripts.":
        "Všechny skripty mají k dispozici následující proměnné.",
    "The complete form JSON object": "Kompletní JSON objekt formuláře",
    "The complete submission object.": "Kompletní objekt odevzdání.",
    "The complete submission data object.": "Kompletní objekt dat odevzdání.",
    'Contextual "row" data, used within DataGrid, EditGrid, and Container components':
        'Kontextová data "řádku", používaná v komponentách DataGrid, EditGrid a Container',
    "The current component JSON": "Aktuální komponentu (JSON)",
    "The current component instance.": "Aktuální instanci komponenty.",
    "The current value of the component.": "Aktuální hodnotu komponenty.",
    "The moment.js library for date manipulation.":
        "Knihovna moment.js pro manipulaci s daty.",
    "An instance of Lodash.": "Instance Lodash.",
    "An instance of the FormioUtils object.": "Instance objektu FormioUtils.",
    'An alias for "utils".': 'Alias pro "utils".',
    "Enter custom javascript code.": "Zadejte vlastní kód (JavaScript).",
    "Example:": "Příklad:",
    "Calculated Value": "Vypočtená hodnota",
    "The decoded JWT token for the authenticated user.":
        "Dekódovaný JWT token pro přihlášeného uživatele.",
    "Execute custom logic using JSONLogic.":
        "Spustit vlastní logiku pomocí JSONLogic.",
    'Full Lodash support is provided using an "_" before each operation, such as {"_sum": {var: "data.a"}}':
        'Plná podpora Lodash je poskytována pomocí "_" před každou operací, například {"_sum": {var: "data.a"}}',
    "Click here for an example": "Klikněte zde pro příklad",
    "Calculate Value on server": "Vypočítat hodnotu na serveru",
    "Checking this will run the calculation on the server. This is useful if you wish to override the values submitted with the calculations performed on the server.":
        "Zaškrtnutím tohoto políčka se výpočet provede na serveru. Je to užitečné, pokud chcete přepsat hodnoty odeslané s výpočty provedenými na serveru.",
    "Allow Manual Override of Calculated Value":
        "Povolit ruční přepsání vypočtené hodnoty",
    "When checked, this will allow the user to manually override the calculated value.":
        "Pokud je zaškrtnuto, uživatel může ručně přepsat vypočtenou hodnotu.",
    "Validate On": "Ověřit při",
    "Determines when this component should trigger front-end validation.":
        "Určuje, kdy by měla tato komponenta spustit ověření na straně klienta.",
    Change: "Změna",
    Blur: "Ztracení zaměření",
    Required: "Vyžadováno",
    "A required field must be filled in before the form can be submitted.":
        "Povinné pole musí být vyplněno před odesláním formuláře.",
    Unique: "Jedinečné",
    "Makes sure the data submitted for this field is unique, and has not been submitted before.":
        "Zajistí, že data odeslaná pro toto pole jsou jedinečná a nebyla odeslána dříve.",
    "Minimum Length": "Minimální délka",
    "The minimum length requirement this field must meet.":
        "Minimální délka, kterou musí toto pole splnit.",
    "Maximum Length": "Maximální délka",
    "The maximum length requirement this field must meet.":
        "Maximální délka, kterou musí toto pole splnit.",
    "Minimum Word Length": "Minimální délka slova",
    "The minimum amount of words that can be added to this field.":
        "Minimální počet slov, které lze do tohoto pole přidat.",
    "Maximum Word Length": "Maximální délka slova",
    "The maximum amount of words that can be added to this field.":
        "Maximální počet slov, které lze do tohoto pole přidat.",
    "Regular Expression Pattern": "Regulární výraz",
    "The regular expression pattern test that the field value must pass before the form can be submitted.":
        "Regulární výraz, který musí hodnota pole projít před odesláním formuláře.",
    "Error Label": "Chybový popisek",
    "The label for this field when an error occurs.":
        "Popisek tohoto pole při výskytu chyby.",
    "Custom Error Message": "Vlastní chybová zpráva",
    "Error message displayed if any error occurred.":
        "Zpráva o chybě zobrazená v případě výskytu chyby.",
    "Custom Validation": "Vlastní ověření",
    "The value that was input into this component":
        "Hodnota, která byla zadána do tohoto komponentu",
    "Enter custom validation code.": "Zadejte vlastní ověřovací kód.",
    "You must assign the valid variable as either true or an error message if validation fails.":
        "Musíte přiřadit platnou proměnnou buď jako true nebo jako chybovou zprávu, pokud ověření selže.",
    "Secret Validation": "Tajné ověření",
    "Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.":
        "Zaškrtněte toto políčko, pokud chcete ověření provést POUZE na straně serveru. Tímto způsobem udržíte svou ověřovací logiku soukromou a tajnou.",
    "JSONLogic Validation": "Ověření JSONLogic",
    "Custom Errors": "Vlastní chyby",
    "Property Name": "Název vlastnosti",
    "The name of this field in the API endpoint.":
        "Název tohoto pole v koncovém bodě API.",
    "Field Tags": "Štítky pole",
    "Tag the field for use in custom logic.":
        "Označte pole pro použití vlastní logiky.",
    "Custom Properties": "Vlastní vlastnosti",
    "This allows you to configure any custom properties for this component.":
        "Tímto způsobem můžete nakonfigurovat jakékoliv vlastní vlastnosti pro tuto komponentu.",
    Value: "Hodnota",
    Key: "Klíč",
    "Add Another": "Přidat další",
    Save: "Uložit",
    Cancel: "Zrušit",
    Remove: "Odstranit",
    Preview: "Náhled",
    Simple: "Jednoduchý",
    "This component should Display:": "Tato komponenta by měla zobrazit:",
    "When the form component:": "Když komponenta formuláře:",
    "Submit (submit)": "Odeslat (submit)",
    "Has the value:": "Má hodnotu:",
    "Advanced Conditions": "Pokročilé podmínky",
    "You must assign the show variable a boolean result.":
        "Musíte přiřadit proměnné show výsledek boolean.",
    "Note: Advanced Conditional logic will override the results of the Simple Conditional logic.":
        "Poznámka: Pokročilá podmíněná logika přepíše výsledky jednoduché podmíněné logiky.",
    Example: "Příklad",
    "Advanced Logic": "Pokročilá logika",
    "Add Logic": "Přidat logiku",
    "Advanced Logic Configured": "nakonfigurované pokročilé logiky",
    "HTML Attributes": "HTML atributy",
    "Attribute Name": "Název atributu",
    "Attribute Value": "Hodnota atributu",
    "Add Attribute": "Přidat atribut",
    "PDF Overlay": "PDF překryv",
    "Provide a map of HTML attributes for component's input element (attributes provided by other component settings or other attributes generated by form.io take precedence over attributes in this grid)":
        "Poskytněte mapu HTML atributů pro vstupní prvek komponentu (atributy poskytnuté jinými nastaveními komponentu nebo jinými atributy generovanými form.io mají přednost před atributy v této mřížce)",
    "The settings inside apply only to the PDF forms.":
        "Nastavení uvnitř se vztahují pouze na PDF formuláře.",
    Style: "Styl",
    Page: "Stránka",
    Left: "Vlevo",
    Top: "Nahoře",
    Width: "Šířka",
    Height: "Výška",
    "Drag and Drop a form component": "Přetáhněte komponentu formuláře",
    Rows: "Řádky",
    "Label Width": "Šířka popisku",
    "The width of label on line in percentages.":
        "Šířka popisku na řádku v procentech.",
    "Label Margin": "Okraj popisku",
    "The width of label margin on line in percentages.":
        "Šířka okraje popisku na řádku v procentech.",
    "Input Type": "Typ vstupu",
    "This is the input type used for this checkbox.":
        "Typ vstupu použitý pro toto zaškrtávací políčko.",
    "Unique Options": "Jedinečné možnosti",
    "Left (Left-aligned)": "Vlevo (zarovnáno vlevo)",
    "Left (Right-aligned)": "Vlevo (zarovnáno vpravo)",
    "Right (Right-aligned)": "Vpravo (zarovnáno vpravo)",
    "Right (Left-aligned)": "Vpravo (zarovnáno vlevo)",
    Bottom: "Dole",
    "Data Source Type": "Typ zdroje dat",
    Values: "Hodnoty",
    Resource: "Zdroj",
    Custom: "Vlastní",
    "Raw JSON": "Surový JSON",
    "Storage Type": "Typ úložiště",
    "The type to store the data. If you select something other than autotype, it will force it to that type.":
        "Typ pro uložení dat. Pokud vyberete něco jiného než autotyp, bude toto nastavení vynuceno.",
    Autotype: "Autotyp",
    String: "Řetězec",
    Object: "Objekt",
    "Item Template": "Šablona položky",
    "The HTML template for the result data items.":
        "HTML šablona pro položky výsledných dat.",
    "ID Path": "Cesta k ID",
    "Path to the select option id.": "Cesta k ID vybrané možnosti.",
    "Refresh Options On": "Obnovit možnosti při",
    "Refresh data when another field changes.":
        "Obnovit data, když se změní jiné pole.",
    "Refresh Options On Blur": "Obnovit možnosti při ztrátě zaměření",
    "Refresh data when another field is blured.":
        "Obnovit data, když se ztratí zaměření jiného pole.",
    "Type to search": "Zadejte hledaný výraz",
    "Clear Value On Refresh Option": "Vymazat hodnotu při obnovení možnosti",
    "When the Refresh On field is changed, clear this components value.":
        "Když se změní pole Obnovit při, vymažte hodnotu této komponenty.",
    "Enable Static Search": "Povolit statické vyhledávání",
    "When checked, the select dropdown will allow for searching within the static list of items provided.":
        "Pokud je zaškrtnuto, rozbalovací seznam výběru umožní vyhledávání v statickém seznamu poskytnutých položek.",
    "Search Threshold": "Práh vyhledávání",
    "At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match, a threshold of 1.0 would match anything.":
        "V jakém bodě algoritmus shody vzdá. Práh 0.0 vyžaduje dokonalou shodu, práh 1.0 by odpovídal čemukoli.",
    "Read Only Value": "Hodnota pouze pro čtení",
    "Check this if you would like to show just the value when in Read Only mode.":
        "Zaškrtněte toto políčko, pokud chcete v režimu pouze pro čtení zobrazit pouze hodnotu.",
    "Choices.js options": "Možnosti Choices.js",
    "A raw JSON object to use as options for the Select component (Choices JS).":
        "Surový JSON objekt použitý jako možnosti pro komponentu Select (Choices JS).",
    "Use exact search": "Použít přesné vyhledávání",
    "Disables search algorithm threshold.":
        "Zakáže práh algoritmu vyhledávání.",
    "Block Button": "Blokové tlačítko",
    "This control should span the full width of the bounding container.":
        "Tento ovládací prvek by měl zabírat celou šířku ohraničujícího kontejneru.",
    "Left Icon": "Ikona vlevo",
    "This is the full icon class string to show the icon. Example: 'fa fa-plus'":
        "Toto je celý řetězec třídy ikony pro zobrazení ikony. Příklad: 'fa fa-plus'",
    "Enter icon classes": "Zadejte třídy ikon",
    "Right Icon": "Ikona vpravo",
    Shortcut: "Zkratka",
    "Shortcut for this component.": "Zkratka pro tuto komponentu.",
    "Disable on Form Invalid": "Vypnout při nevalidním formuláři",
    "This will disable this field if the form is invalid.":
        "Tímto způsobem se toto pole vypne, pokud je formulář nevalidní.",
    "Inline Layout": "Inline rozvržení",
    "Displays the checkboxes/radios horizontally.":
        "Zobrazí zaškrtávací políčka/přepínače vodorovně.",
    Enable: "Povolit",
    "Validate this email using the Kickbox email validation service.":
        "Ověřte tuto e-mailovou adresu pomocí služby ověřování e-mailu Kickbox.",
    Delimiter: "Oddělovač",
    "What is used to separate the tags.": "Co se používá k oddělení štítků.",
    "Max Tags": "Maximální počet štítků",
    "The maximum amount of tags that can be added. 0 for infinity.":
        "Maximální počet štítků, které lze přidat. 0 pro nekonečno.",
    "Store As": "Uložit jako",
    "String (CSV)": "Řetězec (CSV)",
    "Array of Tags": "Pole štítků",
    "Enable Manual Mode": "Povolit ruční režim",
    "Should Manual Mode be enabled for that component or not.":
        "Má být pro tuto komponentu povolen ruční režim nebo ne.",
    "Disable Clear Icon": "Vypnout ikonu vymazání",
    "Clear Icon allows easily clear component's value.":
        "Ikona vymazání umožňuje snadno vymazat hodnotu komponentu.",
    Provider: "Poskytovatel",
    "Which address search service should be used.":
        "Která služba pro vyhledávání adres by měla být použita.",
    "Select your search address provider":
        "Vyberte poskytovatele vyhledávání adres",
    "Manual Mode View String": "Řetězec zobrazení v ručním režimu",
    "Specify template which should be when quering view string for the component value entered in manual mode. This string is used in table view, CSV export and email rendering. When left blank combined value of all components joined with comma will be used.":
        "Určete šablonu, která by měla být použita při dotazu na řetězec zobrazení pro hodnotu komponentu zadanou v ručním režimu. Tento řetězec se používá v tabulkovém zobrazení, exportu CSV a vykreslování e-mailu. Pokud zůstane prázdný, bude použita kombinovaná hodnota všech komponent spojených čárkou.",
    '"address" variable references component value, "data" - submission data and "component" - address component schema.':
        '"address" proměnná odkazuje na hodnotu komponentu, "data" - data odevzdání a "component" - schéma adresní komponenty.',
    "Enter Manual Mode View String":
        "Zadejte řetězec zobrazení v ručním režimu",
    Format: "Formát",
    "The date format for displaying the datetime value.": "Formát data a času.",
    "Use Locale Settings": "Použít nastavení jazyka",
    "Use locale settings to display date and time.":
        "Použít nastavení jazyka pro zobrazení data a času.",
    "Allow Manual Input": "Povolit ruční zadání",
    "Check this if you would like to allow the user to manually enter in the date.":
        "Zaškrtněte toto políčko, pokud chcete uživateli umožnit ručně zadat datum.",
    "Display in Timezone": "Zobrazit v časovém pásmu",
    "of Viewer": "od diváka",
    "of Submission": "od odevzdání",
    "of Location": "od umístění",
    "Shortcut Buttons": "Zkratková tlačítka",
    "You can specify few buttons which will be shown above the calendar. Use Label to specify the name of the button and onClick to specify which date/time will be set when user clicks the button. E.g, date = new Date()":
        "Můžete určit několik tlačítek, která se zobrazí nad kalendářem. Použijte popisek k určení názvu tlačítka a onClick k určení data/času, který bude nastaven, když uživatel klikne na tlačítko. Např. date = new Date()",
    "Use formats provided by DateParser Codes":
        "Použijte formáty poskytované kódy DateParser",
    "Enable Time Input": "Povolit zadání času",
    "Enables time input for this field.": "Povolí zadání času pro toto pole.",
    "Hour Step Size": "Velikost kroku hodin",
    "Minute Step Size": "Velikost kroku minut",
    "The number of hours to increment/decrement in the time picker.":
        "Počet hodin pro zvýšení/snížení výběru času.",
    "The number of minutes to increment/decrement in the time picker.":
        "Počet minut pro zvýšení/snížení výběru času.",
    "12 Hour Time (AM/PM)": "12 hodinový čas (AM/PM)",
    "Display time in 12 hour time with AM/PM.":
        "Zobrazit čas v 12 hodinovém formátu s AM/PM.",
    "Default Date": "Výchozí datum",
    "Use Input to add moment.js for minDate":
        "Použijte vstup pro přidání moment.js pro minDate",
    "Enables to use input for moment functions instead of calendar.":
        "Povolí použití vstupu pro funkce moment místo kalendáře.",
    "Use calendar to set minDate": "Použijte kalendář pro nastavení minDate",
    "Enables to use calendar to set date.":
        "Povolí použití kalendáře pro nastavení data.",
    "Use Input to add moment.js for maxDate":
        "Použijte vstup pro přidání moment.js pro maxDate",
    "Use calendar to set maxDate": "Použijte kalendář pro nastavení maxDate",
    "CSS Class": "CSS třída",
    Attributes: "Atributy",
    Attribute: "Atribut",
    "Refresh On Change": "Obnovit při změně",
    "Column Properties": "Vlastnosti sloupce",
    Size: "Velikost",
    "Auto adjust columns": "Automatické přizpůsobení sloupců",
    "Will automatically adjust columns based on if nested components are hidden.":
        "Automaticky přizpůsobí sloupce na základě toho, zda jsou skryty vnořené komponenty.",
    "The width, offset, push, and pull settings for each column.":
        "Nastavení šířky, posunu, push a pull pro každý sloupec.",
    "Background Color": "Barva pozadí",
    "Footer Label": "Popisek zápatí",
    "The background color of the signature area.":
        "Barva pozadí podpisové oblasti.",
    "Number of Rows": "Počet řádků",
    "Number of Columns": "Počet sloupců",
    "Enter the number or columns that should be displayed by this table.":
        "Zadejte počet sloupců, které by měla tato tabulka zobrazit.",
    "Enter the number or rows that should be displayed by this table.":
        "Zadejte počet řádků, které by měla tato tabulka zobrazit.",
    "Cell Alignment": "Zarovnání buňky",
    Striped: "Pruhovaný",
    "This will stripe the table if checked.":
        "Každý druhý řádek bude pruhovaný.",
    Bordered: "Ohraničený",
    "This will border the table if checked.": "Tabulka bude ohraničená.",
    "Highlight a row on hover.": "Zvýraznit řádek při najetí myší.",
    Condensed: "Zhuštěný",
    "Condense the size of the table.": "Zmenšit velikost tabulky.",
    Theme: "Téma",
    Collapsible: "Sbalitelný",
    "If checked, this will turn this Panel into a collapsible panel.":
        "Pokud je zaškrtnuto, tento panel se stane sbalitelným.",
    "Field Label": "Popisek pole",
    "Label for Key column": "Popisek pro klíčový sloupec",
    "Provide a label text for Key column (otherwise 'Key' will be used)":
        "Zadejte text popisku pro klíčový sloupec (jinak se použije 'Klíč')",
    "Disable Adding / Removing Rows": "Zakázat přidávání/odebírání řádků",
    "Check if you want to hide Add Another button and Remove Row button":
        "Zaškrtněte, pokud chcete skrýt tlačítko Přidat další a tlačítko Odebrat řádek",
    "Show key column before value": "Zobrazit klíčový sloupec před hodnotou",
    "Check if you would like to show the Key before the Value column.":
        "Zaškrtněte, pokud chcete zobrazit klíč před sloupcem Hodnota.",
    "Add Another Text": "Text pro přidání dalšího",
    "Set the text of the Add Another button.":
        "Nastaví text tlačítka Přidat další.",
    "Conditional Add Button": "Podmíněné tlačítko Přidat",
    "Specify condition when Add Button should be displayed.":
        "Určete podmínku, kdy se má zobrazit tlačítko Přidat.",
    "Allow Reorder": "Povolit přeuspořádání",
    "Add Another Position": "Pozice tlačítka Přidat další",
    Both: "Obě",
    "Equal column width": "Stejná šířka sloupce",
    "Enable Row Groups": "Povolit skupiny řádků",
    "Initialize Empty": "Inicializovat prázdné",
    "The DataGrid will have no visible rows when initialized.":
        "DataGrid nebude mít při inicializaci žádné viditelné řádky.",
    "Open First Row when Empty": "Otevřít první řádek, když je prázdný",
    "Check this if you would like to open up the first row when the EditGrid is empty":
        "Zaškrtněte, pokud chcete otevřít první řádek, když je EditGrid prázdný",
    "Display EditGrid as Table": "Zobrazit EditGrid jako tabulku",
    Templates: "Šablony",
    "Header Template": "Šablona záhlaví",
    'Two available variables. "value" is the array of row data and "components" is the array of components in the grid.':
        'Dvě dostupné proměnné. "value" je pole dat řádku a "components" je pole komponent v mřížce.',
    "Row Template": "Šablona řádku",
    'Three available variables. "row" is an object of one row\'s data, "components" is the array of components in the grid and "state" is current row\'s state (can be "draft" or "saved"). To add click events, add the classes "editRow" and "removeRow" to elements.':
        'Tři dostupné proměnné. "row" je objekt dat jednoho řádku, "components" je pole komponent v mřížce a "state" je aktuální stav řádku (může být "draft" nebo "saved"). Chcete-li přidat události kliknutí, přidejte třídy "editRow" a "removeRow" k prvkům.',
    "Footer Template": "Šablona zápatí",
    "Row CSS Class": "CSS třída řádku",
    "Save Row Text": "Text tlačítka Uložit řádek",
    "Display as Modal": "Zobrazit jako modální okno",
    "Display a modal to add or edit entries in the table":
        "Zobrazit modální okno pro přidání nebo úpravu záznamů v tabulce",
    "Remove Row Text": "Text tlačítka Odebrat řádek",
    "Set the text of the remove Row button.":
        "Nastaví text tlačítka Odebrat řádek.",
    "Inline Editing": "Inline úpravy",
    "Check this if you would like your changes within 'edit' mode to be committed directly to the submission object as that row is being changed":
        "Zaškrtněte, pokud chcete, aby se vaše změny v režimu 'edit' přímo zapsaly do objektu odevzdání, když se mění řádek",
    "Enable Row Drafts": "Povolit koncepty řádků",
    "Allow save rows even if their data is invalid. Errors will occur when try to submit with invalid rows.":
        "Povolit uložení řádků, i když jsou jejich data neplatná. Při pokusu o odeslání s neplatnými řádky dojde k chybám.",
};

export { formCsTranslation, formEditCsTranslation };
