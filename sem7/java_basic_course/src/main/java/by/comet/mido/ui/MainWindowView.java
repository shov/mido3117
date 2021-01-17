package by.comet.mido.ui;

import by.comet.mido.converter.ConversionMaxValueException;
import by.comet.mido.converter.EConvertDirection;
import net.miginfocom.swing.MigLayout;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;
import java.awt.event.KeyListener;

/**
 * MVC View
 * Defines all UI, gets init data from model
 */
class MainWindowView extends JFrame {
    private MainWindowModel m_model;
    private StateTextField m_lField;
    private StateTextField m_rField;
    private JButton m_directionBt;
    private JComboBox m_lCombo;
    private JComboBox m_rCombo;
    private JButton m_convertBt;

    private static final String DIRECTION_LR = "→";
    private static final String DIRECTION_RL = "←";

    private boolean m_refresh_mutex = false;

    //TODO Consider to remove model from view
    public MainWindowView(MainWindowModel model) throws Exception {
        super("Converter");

        m_model = model;
        init();
    }

    /**
     * UI Initialization
     */
    private void init() throws Exception {
        setLayout(new MigLayout(
                "",
                "[30mm][pref][30mm]",
                "[min!]10[min!]10[min!]"
        ));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);


        //Components
        m_lField = new StateTextField();
        m_rField = new StateTextField();

        m_directionBt = new JButton();
        m_lCombo = new JComboBox();
        m_rCombo = new JComboBox();
        m_convertBt = new JButton("Convert it!");

        JLabel copyLabel = new JLabel("Education project, Ⓒ Alexandr Shevchenko, 2021, MIT");
        copyLabel.setFont(new Font(null, Font.PLAIN, 9));

        //Getting layout
        add(m_lField, "growx");
        add(m_directionBt, "growx");
        add(m_rField, "growx, wrap");
        add(m_lCombo, "growx");
        add(m_convertBt, "growx");
        add(m_rCombo, "growx, wrap");
        add(copyLabel, "span 3");

        //Set initial text to fields
        m_lField.setText(StateTextField.DEFAULT_TEXT);
        m_rField.setText(StateTextField.DEFAULT_TEXT);

        //Main form state trigger
        //Init direction, populate items, text fields
        refreshDirection();


        //Show
        pack();
        setResizable(false);
        setLocationRelativeTo(null);
    }

    /**
     * Show error message
     *
     * @param message
     */
    public void showError(String message) {
        JOptionPane.showMessageDialog(this, message);
    }


    //UI logic

    /**
     * TODO move states ops to controller-model
     * Refresh converting direction
     * re-populate combos, swap fields
     */
    public void refreshDirection() throws Exception {
        m_refresh_mutex = true;
        try {
            //Swap combos
            JComboBox masterCombo = getMasterCombo();
            JComboBox slaveCombo = getSlaveCombo();

            //(Re)populate combos
            populateMasterCombo(m_model.getMasterComboItems());
            populateSlaveCombo(m_model.getSlaveComboItems((ComboItem) getMasterCombo().getSelectedItem()));

            //Update fields
            StateTextField masterField = getMasterField();
            StateTextField slaveField = getSlaveField();

            //Set field kinds
            masterField.setKind(((ComboItem) masterCombo.getSelectedItem()).getKind());
            slaveField.setKind(((ComboItem) slaveCombo.getSelectedItem()).getKind());

            //Fix texts
            updateFieldText(masterField);
            updateFieldText(slaveField);

            //Set direction caption
            m_directionBt.setText(
                    m_model.getCurrDirection() == EConvertDirection.RIGHT ? DIRECTION_LR : DIRECTION_RL);
        } finally {
            m_refresh_mutex = false;
        }
    }

    /**
     * Populate to Master comboBox
     *
     * @param items
     */
    private void populateMasterCombo(ComboItem[] items) {
        JComboBox combo = getMasterCombo();
        populateCombo(combo, items, false);
    }

    /**
     * Populate to Slave combo
     *
     * @param items
     */
    private void populateSlaveCombo(ComboItem[] items) {
        JComboBox combo = getSlaveCombo();
        populateCombo(combo, items, true);
    }

    private JComboBox getMasterCombo() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_lCombo : m_rCombo;
    }

    private JComboBox getSlaveCombo() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_rCombo : m_lCombo;
    }

    /**
     * Populate items to comboBox
     *
     * @param combo
     * @param items
     * @param sameKind
     */
    private void populateCombo(JComboBox combo, ComboItem[] items, boolean sameKind) {
        ComboItem selected = (ComboItem) combo.getSelectedItem();

        combo.removeAllItems();
        for (ComboItem item : items) {
            combo.addItem(item);
        }

        if (combo.getItemCount() < 1) {
            return;
        }

        boolean sameKindSelect = selected != null && selected.getKind().equals(((ComboItem) combo.getItemAt(0)).getKind());

        if (!sameKind || sameKindSelect) {
            try {
                combo.setSelectedIndex(findComboItemPosition(combo, selected.toString()));
            } catch (Exception e) {
                combo.setSelectedIndex(0);
            }
            return;
        }
        combo.setSelectedIndex(0);
    }

    /**
     * Looking for item position in a comboBox
     *
     * @param comboBox
     * @param label
     * @return position
     * @throws Exception
     */
    private int findComboItemPosition(JComboBox comboBox, String label) throws Exception {
        for (int i = 0; i < comboBox.getItemCount(); i++) {
            if (comboBox.getItemAt(i).toString().equals(label)) {
                return i;
            }
        }
        throw new Exception("Unexpected, item not found!");
    }

    private StateTextField getMasterField() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_lField : m_rField;
    }

    private StateTextField getSlaveField() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_rField : m_lField;
    }

    public void updateFieldText(StateTextField field) throws Exception {
        field.setText(
                m_model.fixValueForItem(field.getKind(), field.getText(), field.getLastText())
        );
    }

    /**
     * TODO move states ops to controller-model
     * Refresh all the things related to changes in combos
     *
     * @param combo
     * @throws Exception
     */
    public void refreshOfChangedCombo(JComboBox combo) throws Exception {
        //Skip processing if it's refreshing by change direction
        if (m_refresh_mutex) {
            return;
        }

        //Get combos
        JComboBox masterCombo = getMasterCombo();
        JComboBox slaveCombo = getSlaveCombo();

        ComboItem masterSelected = (ComboItem) masterCombo.getSelectedItem();
        ComboItem slaveSelected = (ComboItem) slaveCombo.getSelectedItem();

        if (masterSelected == null || slaveSelected == null) {
            throw new Exception("Unexpected! some of selected is null!");
        }

        //Fix fields
        StateTextField masterField = getMasterField();
        StateTextField slaveField = getSlaveField();

        if (masterCombo == combo) {
            boolean mutex_prev = m_refresh_mutex;
            m_refresh_mutex = true;

            //(Re)populate slave
            populateSlaveCombo(m_model.getSlaveComboItems(masterSelected));

            m_refresh_mutex = mutex_prev;
        }

        //Set field kinds
        masterField.setKind(masterSelected.getKind());
        slaveField.setKind(slaveSelected.getKind());

        //Fix texts
        updateFieldText(masterField);
        updateFieldText(slaveField);
    }

    /**
     * TODO move states ops to controller-model
     * Main action
     *
     * @throws Exception
     */
    public void convert() throws Exception {
        JComboBox masterCombo = getMasterCombo();
        JComboBox slaveCombo = getSlaveCombo();

        ComboItem masterSelected = (ComboItem) masterCombo.getSelectedItem();
        ComboItem slaveSelected = (ComboItem) slaveCombo.getSelectedItem();

        if (masterSelected == null && slaveSelected == null) {
            throw new Exception("Unexpected! some of selected is null!");
        }

        StateTextField masterField = getMasterField();
        StateTextField slaveField = getSlaveField();

        try {
            String converted = m_model.convertFigure(
                    masterField.getText(),
                    masterSelected.getKind(),
                    masterSelected.getKey(),
                    slaveSelected.getKey()
            );

            slaveField.setText(converted);
            updateFieldText(slaveField);
        } catch (ConversionMaxValueException e) {
            slaveField.setText(StateTextField.ERROR_TEXT);
            showError("Result unfits allowed range!");
        }
    }


    // Events
    public void addDirectionSwapListener(ActionListener listener) {
        m_directionBt.addActionListener(listener);
    }

    public void addFieldsKeyListener(KeyListener listener) {
        m_lField.addKeyListener(listener);
        m_rField.addKeyListener(listener);
    }

    public void addComboChangeListener(ActionListener listener) {
        m_lCombo.addActionListener(listener);
        m_rCombo.addActionListener(listener);
    }

    public void addConvertListener(ActionListener listener) {
        m_convertBt.addActionListener(listener);
    }

}
