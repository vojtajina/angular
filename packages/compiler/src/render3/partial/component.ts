/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as core from '../../core';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/interpolation_config';
import * as o from '../../output/output_ast';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../parse_util';
import {Identifiers as R3} from '../r3_identifiers';
import {DeclarationListEmitMode, R3ComponentDef, R3ComponentMetadata, R3UsedDirectiveMetadata} from '../view/api';
import {createComponentType} from '../view/compiler';
import {ParsedTemplate} from '../view/template';
import {DefinitionMap} from '../view/util';

import {R3DeclareComponentMetadata} from './api';
import {createDirectiveDefinitionMap} from './directive';
import {toOptionalLiteralArray} from './util';


/**
 * Compile a component declaration defined by the `R3ComponentMetadata`.
 */
export function compileDeclareComponentFromMetadata(
    meta: R3ComponentMetadata, template: ParsedTemplate): R3ComponentDef {
  const definitionMap = createComponentDefinitionMap(meta, template);

  const expression = o.importExpr(R3.declareComponent).callFn([definitionMap.toLiteralMap()]);
  const type = createComponentType(meta);

  return {expression, type};
}

/**
 * Gathers the declaration fields for a component into a `DefinitionMap`.
 */
export function createComponentDefinitionMap(meta: R3ComponentMetadata, template: ParsedTemplate):
    DefinitionMap<R3DeclareComponentMetadata> {
  const definitionMap: DefinitionMap<R3DeclareComponentMetadata> =
      createDirectiveDefinitionMap(meta);

  definitionMap.set('template', getTemplateExpression(template));
  if (template.isInline) {
    definitionMap.set('isInline', o.literal(true));
  }

  definitionMap.set('styles', toOptionalLiteralArray(meta.styles, o.literal));
  definitionMap.set('directives', compileUsedDirectiveMetadata(meta));
  definitionMap.set('pipes', compileUsedPipeMetadata(meta));
  definitionMap.set('viewProviders', meta.viewProviders);
  definitionMap.set('animations', meta.animations);

  if (meta.changeDetection !== undefined) {
    definitionMap.set(
        'changeDetection',
        o.importExpr(R3.ChangeDetectionStrategy)
            .prop(core.ChangeDetectionStrategy[meta.changeDetection]));
  }
  if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
    definitionMap.set(
        'encapsulation',
        o.importExpr(R3.ViewEncapsulation).prop(core.ViewEncapsulation[meta.encapsulation]));
  }
  if (meta.interpolation !== DEFAULT_INTERPOLATION_CONFIG) {
    definitionMap.set(
        'interpolation',
        o.literalArr([o.literal(meta.interpolation.start), o.literal(meta.interpolation.end)]));
  }

  if (template.preserveWhitespaces === true) {
    definitionMap.set('preserveWhitespaces', o.literal(true));
  }

  return definitionMap;
}

function getTemplateExpression(template: ParsedTemplate): o.Expression {
  if (typeof template.template === 'string') {
    if (template.isInline) {
      // The template is inline but not a simple literal string, so give up with trying to
      // source-map it and just return a simple literal here.
      return o.literal(template.template);
    } else {
      // The template is external so we must synthesize an expression node with the appropriate
      // source-span.
      const contents = template.template;
      const file = new ParseSourceFile(contents, template.templateUrl);
      const start = new ParseLocation(file, 0, 0, 0);
      const end = computeEndLocation(file, contents);
      const span = new ParseSourceSpan(start, end);
      return o.literal(contents, null, span);
    }
  } else {
    // The template is inline so we can just reuse the current expression node.
    return template.template;
  }
}

function computeEndLocation(file: ParseSourceFile, contents: string): ParseLocation {
  const length = contents.length;
  let lineStart = 0;
  let lastLineStart = 0;
  let line = 0;
  do {
    lineStart = contents.indexOf('\n', lastLineStart);
    if (lineStart !== -1) {
      lastLineStart = lineStart + 1;
      line++;
    }
  } while (lineStart !== -1);

  return new ParseLocation(file, length, line, length - lastLineStart);
}

/**
 * Compiles the directives as registered in the component metadata into an array literal of the
 * individual directives. If the component does not use any directives, then null is returned.
 */
function compileUsedDirectiveMetadata(meta: R3ComponentMetadata): o.LiteralArrayExpr|null {
  const wrapType = meta.declarationListEmitMode !== DeclarationListEmitMode.Direct ?
      generateForwardRef :
      (expr: o.Expression) => expr;

  return toOptionalLiteralArray(meta.directives, directive => {
    const dirMeta = new DefinitionMap<R3UsedDirectiveMetadata>();
    dirMeta.set('type', wrapType(directive.type));
    dirMeta.set('selector', o.literal(directive.selector));
    dirMeta.set('inputs', toOptionalLiteralArray(directive.inputs, o.literal));
    dirMeta.set('outputs', toOptionalLiteralArray(directive.outputs, o.literal));
    dirMeta.set('exportAs', toOptionalLiteralArray(directive.exportAs, o.literal));
    return dirMeta.toLiteralMap();
  });
}

/**
 * Compiles the pipes as registered in the component metadata into an object literal, where the
 * pipe's name is used as key and a reference to its type as value. If the component does not use
 * any pipes, then null is returned.
 */
function compileUsedPipeMetadata(meta: R3ComponentMetadata): o.LiteralMapExpr|null {
  if (meta.pipes.size === 0) {
    return null;
  }

  const wrapType = meta.declarationListEmitMode !== DeclarationListEmitMode.Direct ?
      generateForwardRef :
      (expr: o.Expression) => expr;

  const entries = [];
  for (const [name, pipe] of meta.pipes) {
    entries.push({key: name, value: wrapType(pipe), quoted: true});
  }
  return o.literalMap(entries);
}

function generateForwardRef(expr: o.Expression): o.Expression {
  return o.importExpr(R3.forwardRef).callFn([o.fn([], [new o.ReturnStatement(expr)])]);
}
