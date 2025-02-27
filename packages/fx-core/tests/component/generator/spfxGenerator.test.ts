// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ContextV3, Inputs, ok, Platform } from "@microsoft/teamsfx-api";
import * as chai from "chai";
import fs from "fs-extra";
import "mocha";
import * as path from "path";
import * as sinon from "sinon";
import * as uuid from "uuid";
import { cpUtils } from "../../../src/common/deps-checker";
import { Generator } from "../../../src/component/generator/generator";
import { SPFxGenerator } from "../../../src/component/generator/spfxGenerator";
import { GeneratorChecker } from "../../../src/component/resource/spfx/depsChecker/generatorChecker";
import { YoChecker } from "../../../src/component/resource/spfx/depsChecker/yoChecker";
import { SPFXQuestionNames } from "../../../src/component/resource/spfx/utils/questions";
import { Utils } from "../../../src/component/resource/spfx/utils/utils";
import { createContextV3, newProjectSettingsV3 } from "../../../src/component/utils";
import { setTools } from "../../../src/core/globalVars";
import { MockTools } from "../../core/utils";

describe("SPFxGenerator", function () {
  const testFolder = path.resolve("./tmp");
  let context: ContextV3;

  beforeEach(async () => {
    const gtools = new MockTools();
    setTools(gtools);
    context = createContextV3(newProjectSettingsV3());

    await fs.ensureDir(testFolder);
    sinon.stub(Utils, "configure");
    sinon.stub(fs, "stat").resolves();
    sinon.stub(YoChecker.prototype, "isInstalled").resolves(true);
    sinon.stub(GeneratorChecker.prototype, "isInstalled").resolves(true);
    sinon.stub(cpUtils, "executeCommand").resolves("succeed");
    const manifestId = uuid.v4();
    sinon.stub(fs, "readFile").resolves(new Buffer(`{"id": "${manifestId}"}`));
    sinon.stub(fs, "writeFile").resolves();
    sinon.stub(fs, "rename").resolves();
    sinon.stub(fs, "copyFile").resolves();
    sinon.stub(fs, "remove").resolves();
    sinon.stub(fs, "readJson").resolves({});
    sinon.stub(fs, "ensureFile").resolves();
    sinon.stub(fs, "writeJSON").resolves();
  });

  it("Both yeoman generator and template generator is called when scaffold SPFx project", async function () {
    const inputs: Inputs = {
      platform: Platform.CLI,
      projectPath: testFolder,
      "app-name": "spfxTestApp",
    };
    const doYeomanScaffoldStub = sinon
      .stub(SPFxGenerator, "doYeomanScaffold" as any)
      .resolves(ok(undefined));
    const generateTemplateStub = sinon
      .stub(Generator, "generateTemplate" as any)
      .resolves(ok(undefined));

    const result = await SPFxGenerator.generate(context, inputs, testFolder);

    chai.expect(result.isOk()).to.eq(true);
    chai.expect(doYeomanScaffoldStub.calledOnce).to.be.true;
    chai.expect(generateTemplateStub.calledOnce).to.be.true;
  });

  it("scaffold SPFx project without framework", async function () {
    sinon.stub(fs, "pathExists").resolves(true);
    sinon.stub(Generator, "generateTemplate" as any).resolves(ok(undefined));
    const inputs: Inputs = {
      platform: Platform.CLI,
      projectPath: testFolder,
      [SPFXQuestionNames.framework_type]: "none",
      [SPFXQuestionNames.webpart_desp]: "test",
      [SPFXQuestionNames.webpart_name]: "hello",
      "app-name": "spfxTestApp",
    };
    const result = await SPFxGenerator.generate(context, inputs, testFolder);

    chai.expect(result.isOk()).to.eq(true);
  });

  it("scaffold SPFx project with react framework", async function () {
    sinon.stub(fs, "pathExists").resolves(true);
    sinon.stub(Generator, "generateTemplate" as any).resolves(ok(undefined));
    const inputs: Inputs = {
      platform: Platform.CLI,
      projectPath: testFolder,
      [SPFXQuestionNames.framework_type]: "react",
      [SPFXQuestionNames.webpart_desp]: "test",
      [SPFXQuestionNames.webpart_name]: "hello",
      "app-name": "spfxTestApp",
    };
    const result = await SPFxGenerator.generate(context, inputs, testFolder);

    chai.expect(result.isOk()).to.eq(true);
  });

  it("scaffold SPFx project with minimal framework", async function () {
    sinon.stub(fs, "pathExists").resolves(true);
    sinon.stub(Generator, "generateTemplate" as any).resolves(ok(undefined));
    const inputs: Inputs = {
      platform: Platform.CLI,
      projectPath: testFolder,
      [SPFXQuestionNames.framework_type]: "minimal",
      [SPFXQuestionNames.webpart_desp]: "test",
      [SPFXQuestionNames.webpart_name]: "hello",
      "app-name": "spfxTestApp",
    };
    const result = await SPFxGenerator.generate(context, inputs, testFolder);

    chai.expect(result.isOk()).to.eq(true);
  });

  it("scaffold SPFx project with extremely long webpart name", async function () {
    sinon.stub(fs, "pathExists").resolves(true);
    sinon.stub(Generator, "generateTemplate" as any).resolves(ok(undefined));
    const inputs: Inputs = {
      platform: Platform.CLI,
      projectPath: testFolder,
      [SPFXQuestionNames.framework_type]: "minimal",
      [SPFXQuestionNames.webpart_desp]: "test",
      [SPFXQuestionNames.webpart_name]:
        "extremelylongextremelylongextremelylongextremelylongspfxwebpartname",
      "app-name": "spfxTestApp",
    };
    const result = await SPFxGenerator.generate(context, inputs, testFolder);

    chai.expect(result.isOk()).to.eq(true);
  });

  afterEach(async () => {
    sinon.restore();
  });
});
