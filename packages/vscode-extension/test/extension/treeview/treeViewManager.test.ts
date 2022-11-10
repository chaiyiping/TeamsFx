import * as chai from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { AdaptiveCardCodeLensProvider } from "../../../src/codeLensProvider";
import { TreatmentVariableValue } from "../../../src/exp/treatmentVariables";
import { CommandsTreeViewProvider } from "../../../src/treeview/commandsTreeViewProvider";
import treeViewManager from "../../../src/treeview/treeViewManager";

describe("TreeViewManager", () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it("registerTreeViews", async () => {
    treeViewManager.registerTreeViews({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    chai.assert.isDefined(treeViewManager.getTreeView("teamsfx-accounts"));
  });

  it("setRunningCommand", async () => {
    treeViewManager.registerTreeViews({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    const command = (treeViewManager as any).commandMap.get("fx-extension.create");
    const setStatusStub = sinon.stub(command, "setStatus");
    treeViewManager.setRunningCommand("fx-extension.create", ["fx-extension.openSamples"]);

    chai.assert.equal(setStatusStub.callCount, 1);

    treeViewManager.restoreRunningCommand(["fx-extension.openSamples"]);
    chai.assert.equal(setStatusStub.callCount, 2);
  });

  it("updateTreeViewsByContent", async () => {
    sandbox
      .stub(AdaptiveCardCodeLensProvider, "detectedAdaptiveCards")
      .returns(Promise.resolve(true));

    treeViewManager.registerTreeViews({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    const developmentTreeviewProvider = treeViewManager.getTreeView(
      "teamsfx-development"
    ) as CommandsTreeViewProvider;

    const commands = developmentTreeviewProvider.getCommands();
    chai.assert.equal(commands.length, 5);

    await treeViewManager.updateTreeViewsByContent();

    chai.assert.equal(commands.length, 6);
  });

  it("updateTreeViewsByContent - inProductDoc enabled", async () => {
    sandbox
      .stub(AdaptiveCardCodeLensProvider, "detectedAdaptiveCards")
      .returns(Promise.resolve(true));
    sandbox.stub(TreatmentVariableValue, "inProductDoc").value(true);

    treeViewManager.registerTreeViews({
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    const developmentTreeviewProvider = treeViewManager.getTreeView(
      "teamsfx-development"
    ) as CommandsTreeViewProvider;

    const commands = developmentTreeviewProvider.getCommands();
    chai.assert.equal(commands.length, 5);

    await treeViewManager.updateTreeViewsByContent();

    chai.assert.equal(commands.length, 7);
  });
});
