package by.comet.mido.ui;

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
     * Refresh converting direction
     * re-populate combos, swap fields
     */
    public void refreshDirection() throws Exception {
        //Swap combos
        JComboBox masterCombo = getMasterCombo();
        JComboBox slaveCombo = getSlaveCombo();
        ComboItem masterSelected = (ComboItem) masterCombo.getSelectedItem();
        ComboItem slaveSelected = (ComboItem) slaveCombo.getSelectedItem();

        if (masterSelected != null && slaveSelected != null) {
            masterCombo.setSelectedIndex(findComboItemPosition(masterCombo, slaveSelected.toString()));
            slaveCombo.setSelectedIndex(findComboItemPosition(slaveCombo, masterSelected.toString()));
        }

        //(Re)populate combos
        populateMasterCombo(m_model.getMasterComboItems());
        populateSlaveCombo(m_model.getSlaveComboItems((ComboItem) getMasterCombo().getSelectedItem()));

        //Swap fields
        StateTextField masterField = getMasterField();
        StateTextField slaveField = getSlaveField();

        //Set field kinds
        masterField.setKind(((ComboItem) masterCombo.getSelectedItem()).getKind());
        slaveField.setKind(((ComboItem) slaveCombo.getSelectedItem()).getKind());

        //Swap texts
        String textBuff = masterField.getText();
        masterField.setText(slaveField.getText());
        slaveField.setText(textBuff);

        //Fix texts
        updateFieldText(masterField);
        updateFieldText(slaveField);

        //Set direction caption
        m_directionBt.setText(
                m_model.getCurrDirection() == EConvertDirection.RIGHT ? DIRECTION_LR : DIRECTION_RL);
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
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_rCombo : m_lCombo;
    }

    private JComboBox getSlaveCombo() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_lCombo : m_rCombo;
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
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_rField : m_lField;
    }

    private StateTextField getSlaveField() {
        return m_model.getCurrDirection() == EConvertDirection.RIGHT ? m_lField : m_rField;
    }

    public void updateFieldText(StateTextField field) throws Exception {
        field.setText(
                m_model.fixValueForItem(field.getKind(), field.getText(), field.getLastText())
        );
    }

    public void refreshState() throws Exception {
        //Swap combos
        JComboBox masterCombo = getMasterCombo();
        JComboBox slaveCombo = getSlaveCombo();
        ComboItem masterSelected = (ComboItem) masterCombo.getSelectedItem();
        ComboItem slaveSelected = (ComboItem) slaveCombo.getSelectedItem();

        if (masterSelected != null && slaveSelected != null) {
            masterCombo.setSelectedIndex(findComboItemPosition(masterCombo, slaveSelected.toString()));
            slaveCombo.setSelectedIndex(findComboItemPosition(slaveCombo, masterSelected.toString()));
        }

        //(Re)populate slave
        populateSlaveCombo(m_model.getSlaveComboItems((ComboItem) getMasterCombo().getSelectedItem()));

        //Fix fields
        StateTextField masterField = getMasterField();
        StateTextField slaveField = getSlaveField();

        //Set field kinds
        masterField.setKind(((ComboItem) masterCombo.getSelectedItem()).getKind());
        slaveField.setKind(((ComboItem) slaveCombo.getSelectedItem()).getKind());

        //Fix texts
        updateFieldText(masterField);
        updateFieldText(slaveField);
    }

    public void convert() {
        System.out.println("Convert!");
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

    public void addConverListener(ActionListener listener) {
        m_convertBt.addActionListener(listener);
    }

}
