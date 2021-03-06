import {describe, ddescribe, it, iit, expect} from 'test_lib/test_lib';

function sum(a, b) {
  return a + b;
}


export function main() {
  describe('functions', function() {
    it('should work', function() {
      expect(sum(1, 2)).toBe(3);
    });

    describe("named parameters", function() {
      it('should pass named params as named params by using identifier keys', function() {
        function f(a, {b, c}) {return a + b + c;}
        expect(f(1, {b: 2, c: 3})).toBe(6);
      });

      it('should pass named params as a map by using quoted keys', function() {
        function f(m) {return m["a"] + m["b"];}

        expect(f({"a": 1, "b": 2})).toBe(3);
      });

      it('should compile initializers', function() {
        function f({a=1, b=2}) {return a + b;}
        expect(f({a:10})).toBe(12);
      });

      it("should call function with named params without passing any" +
        "params by providing an empty object initializer", function() {
        function f({a=1, b=2}={}) {return a + b;}

        expect(f({a: 10})).toBe(12);
        expect(f()).toBe(3);
      });
    });
  });
}
