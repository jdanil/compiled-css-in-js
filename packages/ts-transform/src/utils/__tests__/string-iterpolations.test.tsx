import { cssBeforeInterpolation, cssAfterInterpolation } from '../string-interpolations';

describe('template literal to css', () => {
  describe('interpolations with surrounding css', () => {
    it('should extract the prefix of a simple template literal', () => {
      const simpleParts = ['content: "', '";font-color:blue;'];

      const extract = cssBeforeInterpolation(simpleParts[0]);

      expect(extract.variablePrefix).toEqual('"');
      expect(extract.css).toEqual('content: ');
    });

    it('should extract the suffix of a simple template literal', () => {
      const simpleParts = ['content: "', '";font-color:blue;'];

      const extract = cssAfterInterpolation(simpleParts[1]);

      expect(extract.variableSuffix).toEqual('"');
      expect(extract.css).toEqual(';font-color:blue;');
    });

    it('should extract the prefix of a complex template literal', () => {
      const complexParts = ['transform: translateX(', ');color:blue;'];

      const extract = cssBeforeInterpolation(complexParts[0]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual('transform: translateX(');
    });

    it('should extract the suffix of a complex template literal', () => {
      const complexParts = ['transform: translateX(', ');color:blue;'];

      const extract = cssAfterInterpolation(complexParts[1]);

      expect(extract.variableSuffix).toEqual('');
      expect(extract.css).toEqual(');color:blue;');
    });

    it('should extract first part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform: transform3d(', ', ', ')'];

      const extract = cssBeforeInterpolation(complexPartsNoPropertyName[0]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual('transform: transform3d(');
    });

    it('should extract before second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform: transform3d(', ', ', ')'];

      const extract = cssBeforeInterpolation(complexPartsNoPropertyName[1]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual(', ');
    });

    it('should extract after second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform: transform3d(', ', ', ')'];

      const extract = cssAfterInterpolation(complexPartsNoPropertyName[1]);

      expect(extract.variableSuffix).toEqual('');
      expect(extract.css).toEqual(', ');
    });

    it('should extract second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform: transform3d(', ', ', ')'];

      const extract = cssAfterInterpolation(complexPartsNoPropertyName[2]);

      expect(extract.variableSuffix).toEqual('');
      expect(extract.css).toEqual(')');
    });

    it('should get the before and after for the first part of a transform interpolation', () => {
      const css = [`transform: translate3d(`, `px, `, `, 0);`];

      const before = cssBeforeInterpolation(css[0]);
      const after = cssAfterInterpolation(css[1]);

      expect(before.variablePrefix).toEqual(undefined);
      expect(before.css).toEqual(css[0]);
      expect(after.variableSuffix).toEqual('px');
      expect(after.css).toEqual(', ');
    });

    it('should get the before and after for the second part of a transform interpolation', () => {
      const css = [`\n            transform: translate3d(var(--var-test), `, `, 0);`];

      const before = cssBeforeInterpolation(css[0]);
      const after = cssAfterInterpolation(css[1]);

      expect(before.variablePrefix).toEqual(undefined);
      expect(before.css).toEqual('\n            transform: translate3d(var(--var-test), ');
      expect(after.variableSuffix).toEqual('');
      expect(after.css).toEqual(', 0);');
    });
  });

  describe('interpolations with multiple groups', () => {
    it('should extract the first part of the first group', () => {
      const parts = [
        'background-image: linear-gradient(45deg, ',
        ' 25%, transparent 25%),',
        'linear-gradient(-45deg, ',
        ' 25%, transparent 25%),',
        'linear-gradient(45deg, transparent 75%, ',
        ' 75%),',
        'linear-gradient(-45deg, transparent 75%, ',
        ' 75%);',
      ];

      const before = cssBeforeInterpolation(parts[0]);
      const after = cssAfterInterpolation(parts[1]);

      expect(before.css).toEqual(parts[0]);
      expect(before.variablePrefix).toEqual(undefined);
      expect(after.variableSuffix).toEqual('');
      expect(after.css).toEqual(parts[1]);
    });

    it('should extract the first part of the second group', () => {
      const parts = [
        'background-image: linear-gradient(45deg, var(--var-test) 25%, transparent 25%),',
        'linear-gradient(-45deg, ',
        ' 25%, transparent 25%),',
        'linear-gradient(45deg, transparent 75%, ',
        ' 75%),',
        'linear-gradient(-45deg, transparent 75%, ',
        ' 75%);',
      ];

      const before = cssBeforeInterpolation(parts[0]);
      const after = cssAfterInterpolation(parts[1]);

      expect(before.css).toEqual(parts[0]);
      expect(before.variablePrefix).toEqual(undefined);
      expect(after.css).toEqual(parts[1]);
      expect(after.variableSuffix).toEqual('');
    });

    it('should extract the first part of the third group', () => {
      const parts = [
        'background-image: linear-gradient(45deg, var(--var-test) 25%, transparent 25%), linear-gradient(-45deg, var(--var-test) 25%, transparent 25%),',
        'linear-gradient(45deg, transparent 75%, ',
        ' 75%),',
        'linear-gradient(-45deg, transparent 75%, ',
        ' 75%);',
      ];

      const before = cssBeforeInterpolation(parts[0]);
      const after = cssAfterInterpolation(parts[1]);

      expect(before.css).toEqual(parts[0]);
      expect(before.variablePrefix).toEqual(undefined);
      expect(after.css).toEqual(parts[1]);
      expect(after.variableSuffix).toEqual('');
    });

    it('should extract the first part of the fourth group', () => {
      const parts = [
        'background-image: linear-gradient(45deg, var(--var-test) 25%, transparent 25%), linear-gradient(-45deg, var(--var-test) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--var-test) 75%),',
        'linear-gradient(-45deg, transparent 75%, ',
        ' 75%);',
      ];

      const before = cssBeforeInterpolation(parts[0]);
      const after = cssAfterInterpolation(parts[1]);

      expect(before.css).toEqual(parts[0]);
      expect(before.variablePrefix).toEqual(undefined);
      expect(after.css).toEqual(parts[1]);
      expect(after.variableSuffix).toEqual('');
    });
  });

  describe('interpolations without surrounding css', () => {
    it('should extract the suffix with not prefix', () => {
      const simpleParts = ['px'];

      const extract = cssAfterInterpolation(simpleParts[0]);

      expect(extract.variableSuffix).toEqual('px');
      expect(extract.css).toEqual('');
    });

    it('should extract the prefix of a simple template literal', () => {
      const simpleParts = ['"', '"'];

      const extract = cssBeforeInterpolation(simpleParts[0]);

      expect(extract.variablePrefix).toEqual('"');
      expect(extract.css).toEqual('');
    });

    it('should extract the suffix of a simple template literal', () => {
      const simpleParts = ['"', '"'];

      const extract = cssAfterInterpolation(simpleParts[1]);

      expect(extract.variableSuffix).toEqual('"');
      expect(extract.css).toEqual('');
    });

    it('should extract prefix from css calac function', () => {
      const complexPartsNoPropertyName = ['calc(100% - ', 'px)'];

      const extract = cssBeforeInterpolation(complexPartsNoPropertyName[0]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual('calc(100% - ');
    });

    it('should extract suffix from css calc function', () => {
      const complexPartsNoPropertyName = ['calc(100% - ', 'px)'];

      const extract = cssAfterInterpolation(complexPartsNoPropertyName[1]);

      expect(extract.variableSuffix).toEqual('px');
      expect(extract.css).toEqual(')');
    });

    it('should extract first part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform3d(', ', ', ')'];

      const extract = cssBeforeInterpolation(complexPartsNoPropertyName[0]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual('transform3d(');
    });

    it('should extract before second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform3d(', ', ', ')'];

      const extract = cssBeforeInterpolation(complexPartsNoPropertyName[1]);

      expect(extract.variablePrefix).toEqual(undefined);
      expect(extract.css).toEqual(', ');
    });

    it('should extract after second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform3d(', ', ', ')'];

      const extract = cssAfterInterpolation(complexPartsNoPropertyName[1]);

      expect(extract.variableSuffix).toEqual('');
      expect(extract.css).toEqual(', ');
    });

    it('should extract second part of a three part value', () => {
      const complexPartsNoPropertyName = ['transform3d(', ', ', ')'];

      const extract = cssAfterInterpolation(complexPartsNoPropertyName[2]);

      expect(extract.variableSuffix).toEqual('');
      expect(extract.css).toEqual(')');
    });
  });
});
