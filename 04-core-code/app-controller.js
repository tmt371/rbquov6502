// File: 04-core-code/app-controller.js

import { EVENTS } from "./config/constants.js"
import * as uiActions from "./actions/ui-actions.js"

/**
 * @fileoverview Central application controller.
 * Manages the overall application flow and interactions between different components.
 */
export class AppController {
    constructor({ eventAggregator, stateService, quickQuoteView, detailConfigView, workflowService }) {
        this.eventAggregator = eventAggregator
        this.stateService = stateService
        this.quickQuoteView = quickQuoteView
        this.detailConfigView = detailConfigView
        this.workflowService = workflowService

        this._subscribeToEvents()
        console.log("AppController (Refactored with grouped subscriptions) Initialized.")
    }

    _subscribeToEvents() {
        const eventSubscriptions = {
            [EVENTS.APP_READY]: () => {
                setTimeout(() => {
                    this.eventAggregator.publish(EVENTS.FOCUS_CELL, { rowIndex: 0, column: "width" })
                }, 100)
            },
            [EVENTS.FOCUS_CELL]: (data) => {
                this.stateService.dispatch(uiActions.setActiveCell(data.rowIndex, data.column))
            },
            ...this._getViewEventSubscriptions(),
            ...this._getWorkflowEventSubscriptions(),
        }

        for (const event in eventSubscriptions) {
            this.eventAggregator.subscribe(event, eventSubscriptions[event])
        }
    }

    _getViewEventSubscriptions() {
        return {
            [EVENTS.NUMERIC_KEY_PRESSED]: (data) => this.quickQuoteView.handleNumericKeyPress(data),
            [EVENTS.INSERT_ROW_CLICKED]: () => this.quickQuoteView.handleInsertRow(),
            [EVENTS.DELETE_ROW_CLICKED]: () => this.quickQuoteView.handleDeleteRow(),
            [EVENTS.CLEAR_ROW_CLICKED]: () => this.quickQuoteView.handleClearRow(),
            [EVENTS.SAVE_TO_FILE_CLICKED]: () => this.quickQuoteView.handleSaveToFile(),
            [EVENTS.EXPORT_CSV_CLICKED]: () => this.quickQuoteView.handleExportCSV(),
            [EVENTS.RESET_CLICKED]: () => this.quickQuoteView.handleReset(),
            [EVENTS.MOVE_ACTIVE_CELL]: (data) => this.quickQuoteView.handleMoveActiveCell(data),
            [EVENTS.CALCULATE_SUM_CLICKED]: () => this.quickQuoteView.handleCalculateAndSum(),
            [EVENTS.TABLE_CELL_CLICKED]: (data) => this.quickQuoteView.handleTableCellClick(data),
            [EVENTS.SEQUENCE_CELL_CLICKED]: (data) => this.quickQuoteView.handleSequenceCellClick(data),
            [EVENTS.TYPE_CELL_CLICKED]: () => this.quickQuoteView.handleCycleType(),
            [EVENTS.MULTI_SELECT_MODE_TOGGLED]: () => this.quickQuoteView.handleToggleMultiSelectMode(),
            [EVENTS.SAVE_THEN_LOAD_CLICKED]: () => this.quickQuoteView.handleSaveThenLoad(),
            [EVENTS.TYPE_CELL_LONG_PRESS]: (data) => this.quickQuoteView.handleTypeCellLongPress(data),
            [EVENTS.TYPE_BUTTON_LONG_PRESS]: () => this.quickQuoteView.handleTypeButtonLongPress(),
            [EVENTS.USER_REQUESTED_MULTI_TYPE_SET]: () => this.quickQuoteView.handleMultiTypeSet(),
            [EVENTS.NAV_ITEM_CLICKED]: (data) => this.detailConfigView.handleNavigation(data),
            [EVENTS.K1_INPUT_KEYUP]: (data) => this.detailConfigView.handleK1Input(data),
            [EVENTS.K1_INPUT_BLUR]: (data) => this.detailConfigView.handleK1Blur(data),
            [EVENTS.K1_BATCH_APPLY_CLICKED]: () => this.detailConfigView.handleK1BatchApply(),
            [EVENTS.FABRIC_TYPE_SELECTED]: (data) => this.detailConfigView.handleFabricTypeSelection(data),
            [EVENTS.FABRIC_ROW_CLICKED]: (data) => this.detailConfigView.handleFabricRowClick(data),
            [EVENTS.CLEAR_LF_SELECTION_CLICKED]: () => this.detailConfigView.handleClearLfSelection(),
            [EVENTS.K2_BATCH_APPLY_CLICKED]: () => this.detailConfigView.handleK2BatchApply(),
            [EVENTS.K2_CLEAR_FABRIC_COLOR_CLICKED]: () => this.detailConfigView.handleK2ClearFabricAndColor(),
            [EVENTS.K3_CELL_CLICKED]: (data) => this.detailConfigView.handleK3CellClick(data),
            [EVENTS.K4_DRIVE_OPTION_CLICKED]: (data) => this.detailConfigView.handleDriveOptionClick(data),
            [EVENTS.K4_ACCESSORY_ADJUSTED]: (data) => this.detailConfigView.handleAccessoryAdjustment(data),
            [EVENTS.K5_DUAL_OPTION_CLICKED]: (data) => this.detailConfigView.handleDualOptionClick(data),
            [EVENTS.DUAL_CHAIN_KEY_PRESSED]: (data) => this.detailConfigView.handleDualChainKeyPress(data),
            [EVENTS.F1_INPUT_CHANGED]: (data) => this.detailConfigView.handleF1InputChange(data),
            [EVENTS.F2_INPUT_CHANGED]: (data) => this.detailConfigView.handleF2InputChange(data),
            [EVENTS.F2_CHECKBOX_CLICKED]: (data) => this.detailConfigView.handleF2CheckboxClick(data),
        }
    }

    _getWorkflowEventSubscriptions() {
        return {
            [EVENTS.SHOW_NOTIFICATION]: (data) => this.workflowService.showNotification(data.message, data.type),
            [EVENTS.SHOW_CONFIRMATION_DIALOG]: (data) =>
                this.workflowService.showDialog(data.message, data.layout, data.position),
            [EVENTS.TRIGGER_FILE_LOAD]: () => this.workflowService.triggerFileLoad(),
            [EVENTS.FILE_LOADED]: (data) => this.workflowService.handleFileLoaded(data),
        }
    }

    run() {
        this.eventAggregator.publish(EVENTS.APP_READY)
    }
}
