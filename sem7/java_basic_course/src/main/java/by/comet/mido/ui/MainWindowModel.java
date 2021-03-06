package by.comet.mido.ui;

import by.comet.mido.converter.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * MVC model
 * provides UI with data got from logic
 */
class MainWindowModel {
    private EConvertDirection m_currDirection = EConvertDirection.RIGHT;

    private IConvertingFigure[] m_figureRepos;
    private Map<String, IConvertingFigure> m_figureReposMap;
    private Map<String, Unit[]> m_figureReposContentMap;

    private ArrayList<ComboItem> m_masterComboItems;

    public MainWindowModel() {

        //Fill in figure repos (manually)
        m_figureRepos = new IConvertingFigure[3];
        m_figureRepos[0] = new FigureMass();
        m_figureRepos[1] = new FigureDistance();
        m_figureRepos[2] = new FigureDigits();

        m_figureReposMap = new HashMap<String, IConvertingFigure>();
        m_figureReposContentMap = new HashMap<String, Unit[]>();


        //Save master combo items, fill figures map
        m_masterComboItems = new ArrayList<ComboItem>();
        for (IConvertingFigure repo : m_figureRepos) {
            Unit[] repoUnits = repo.getUnits();

            m_figureReposMap.put(repo.getKind(), repo);
            m_figureReposContentMap.put(repo.getKind(), repoUnits);


            for (Unit unit : repoUnits) {
                m_masterComboItems.add(new ComboItem(
                        unit.getKind(),
                        unit.getKey(),
                        unit.getLabel()
                ));
            }
        }
    }

    /**
     * @return current convert direction
     */
    public EConvertDirection getCurrDirection() {
        return m_currDirection;
    }

    public void swapDirection() {
        m_currDirection =
                m_currDirection == EConvertDirection.RIGHT
                        ? EConvertDirection.LEFT
                        : EConvertDirection.RIGHT;
    }

    /**
     * @return All available figures
     */
    public ComboItem[] getMasterComboItems() {
        return m_masterComboItems.toArray(new ComboItem[0]);
    }

    /**
     * @param masterSelectedItem
     * @return figures of the same kind
     */
    public ComboItem[] getSlaveComboItems(ComboItem masterSelectedItem) {
        ArrayList<ComboItem> buff = new ArrayList<ComboItem>();
        for (ComboItem item : m_masterComboItems) {
            if (masterSelectedItem.getKind().equals(item.getKind())) {
                buff.add(item);
            }
        }
        return buff.toArray(new ComboItem[0]);
    }

    public String getDefaultValueByKind(String kind) throws Exception {
        IConvertingFigure repo = getFigureRepoByKind(kind);
        return repo.getDefaultValue();
    }

    /**
     * Perform converting
     */
    public String convertFigure(String value, String kind, int fromKey, int toKey) throws Exception {
        IConvertingFigure repo = getFigureRepoByKind(kind);
        return repo.convert(value, fromKey, toKey);
    }

    private IConvertingFigure getFigureRepoByKind(String kind) throws Exception {
        IConvertingFigure repo = m_figureReposMap.get(kind);
        if (null == repo) {
            throw new Exception("Unexpected, cannot find figures for given kind " + kind);
        }
        return repo;
    }
}
